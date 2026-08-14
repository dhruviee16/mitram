import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { saveTrip, unsaveTrip } from "@/server/services/savedTripService";

const bodySchema = z.object({ tripId: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  await saveTrip(session.user.id, parsed.data.tripId);
  return NextResponse.json({ saved: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");
  if (!tripId) {
    return NextResponse.json({ error: "Missing tripId." }, { status: 400 });
  }

  await unsaveTrip(session.user.id, tripId);
  return NextResponse.json({ saved: false });
}
