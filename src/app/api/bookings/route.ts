import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { bookingRequestSchema } from "@/lib/validations/booking";
import { createBooking } from "@/server/services/bookingService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const result = await createBooking(session.user.id, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("createBooking failed:", err);
    const message = err instanceof Error && err.message === "Trip not found."
      ? err.message
      : "Could not create booking.";
    return NextResponse.json({ error: message }, { status: message === "Trip not found." ? 404 : 500 });
  }
}
