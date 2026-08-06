import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { vendorTripSchema } from "@/lib/validations/vendor";
import { updateTrip } from "@/server/services/vendorService";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    return NextResponse.json({ error: "Not signed in as a vendor." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = vendorTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const result = await updateTrip(id, session.user.id, parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("updateTrip failed:", err);
    const message = err instanceof Error ? err.message : "Could not update trip.";
    return NextResponse.json(
      { error: message },
      { status: message === "Trip not found." ? 404 : 500 }
    );
  }
}
