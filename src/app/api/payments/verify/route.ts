import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/server/db";
import { verifyAndConfirmPayment } from "@/server/services/paymentService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body ?? {};
  if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== session.user.id) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const result = await verifyAndConfirmPayment({
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  if (!result.confirmed) {
    return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });
  }

  return NextResponse.json({ confirmed: true });
}
