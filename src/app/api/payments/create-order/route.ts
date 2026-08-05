import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOrderForBooking } from "@/server/services/paymentService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const bookingId = typeof body?.bookingId === "string" ? body.bookingId : null;
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId." }, { status: 400 });
  }

  try {
    const order = await createOrderForBooking(bookingId, session.user.id);
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("createOrderForBooking failed:", err);
    const message = err instanceof Error ? err.message : "Could not start payment.";
    const isNotFound = message === "Booking not found.";
    return NextResponse.json({ error: message }, { status: isNotFound ? 404 : 500 });
  }
}
