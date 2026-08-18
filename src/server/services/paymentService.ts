import Razorpay from "razorpay";
import crypto from "node:crypto";
import { prisma } from "@/server/db";

// Plain string `!==` on a signature leaks timing information an attacker
// could use to guess it byte-by-byte. Always compare HMAC digests this way.
export function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function decrementSeatsForBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking?.tripDateId) return;

  const tripDate = await prisma.tripDate.findUnique({ where: { id: booking.tripDateId } });
  if (!tripDate || tripDate.seatsAvailable === null) return;

  await prisma.tripDate.update({
    where: { id: booking.tripDateId },
    data: { seatsAvailable: Math.max(0, tripDate.seatsAvailable - booking.numTravelers) },
  });
}

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET).");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createOrderForBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) {
    throw new Error("Booking not found.");
  }
  if (booking.status === "confirmed") {
    throw new Error("This booking is already paid.");
  }

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: booking.totalAmount * 100, // paise
    currency: "INR",
    receipt: booking.id,
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: { razorpayOrderId: order.id, amount: booking.totalAmount, status: "created" },
    create: {
      bookingId: booking.id,
      razorpayOrderId: order.id,
      amount: booking.totalAmount,
      status: "created",
    },
  });

  return {
    orderId: order.id,
    amount: booking.totalAmount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
  };
}

export async function verifyAndConfirmPayment(input: {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay is not configured.");
  }

  const payment = await prisma.payment.findUnique({ where: { bookingId: input.bookingId } });
  if (!payment) {
    return { confirmed: false as const };
  }

  // Idempotent: a legitimate client retry (e.g. flaky network after success)
  // replays the same already-verified order/payment pair. Return success
  // without re-processing rather than erroring.
  if (payment.status === "paid") {
    return {
      confirmed: payment.razorpayOrderId === input.razorpayOrderId &&
        payment.razorpayPaymentId === input.razorpayPaymentId,
    };
  }

  // Bind verification to the order actually created for THIS booking.
  // Without this check, a valid signature from a cheap/legitimately-paid
  // order could be replayed against a different, more expensive booking
  // the same user owns, marking it "paid" without ever paying for it.
  if (payment.status !== "created" || payment.razorpayOrderId !== input.razorpayOrderId) {
    return { confirmed: false as const };
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  if (!timingSafeEqualHex(expectedSignature, input.razorpaySignature)) {
    return { confirmed: false as const };
  }

  await prisma.payment.update({
    where: { bookingId: input.bookingId },
    data: { status: "paid", razorpayPaymentId: input.razorpayPaymentId },
  });
  await prisma.booking.update({
    where: { id: input.bookingId },
    data: { status: "confirmed" },
  });
  await decrementSeatsForBooking(input.bookingId);

  return { confirmed: true as const };
}

/**
 * Server-to-server reconciliation path: Razorpay calls our webhook directly
 * with a payment.captured event, independent of whether the customer's
 * browser is still around. This is what catches the case the client-driven
 * verify() above can't: a successful charge where the tab closed, the
 * network dropped, or the JS crashed right after Razorpay's popup succeeded
 * but before /api/payments/verify was called.
 *
 * Authenticity here comes from the caller (the webhook route) having already
 * verified the webhook signature over the raw request body; this function
 * trusts that and just does the idempotent state transition.
 */
export async function confirmPaymentFromWebhook(razorpayOrderId: string, razorpayPaymentId: string) {
  const payment = await prisma.payment.findFirst({ where: { razorpayOrderId } });
  if (!payment || payment.status === "paid") {
    return; // unknown order, or already reconciled by the client-driven path; no-op either way
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "paid", razorpayPaymentId },
  });
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "confirmed" },
  });
  await decrementSeatsForBooking(payment.bookingId);
}
