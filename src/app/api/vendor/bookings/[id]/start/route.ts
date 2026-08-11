import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { startTrip } from "@/server/services/vendorService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    return NextResponse.json({ error: "Not signed in as a vendor." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const booking = await startTrip(id, session.user.id);
    return NextResponse.json(booking);
  } catch (err) {
    console.error("startTrip failed:", err);
    const message = err instanceof Error ? err.message : "Could not start trip.";
    const status = message === "Booking not found." ? 404 : message === "Booking is not confirmed." ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
