import Razorpay from "razorpay";
import crypto from "node:crypto";
import { prisma } from "@/server/db";

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

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== input.razorpaySignature) {
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

  return { confirmed: true as const };
}
