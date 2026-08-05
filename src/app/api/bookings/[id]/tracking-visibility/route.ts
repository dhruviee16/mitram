import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { trackingVisibilitySchema } from "@/lib/validations/booking";
import { setTrackingVisibility } from "@/server/services/bookingService";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = trackingVisibilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const result = await setTrackingVisibility(id, session.user.id, parsed.data.visible);
    return NextResponse.json(result);
  } catch (err) {
    console.error("setTrackingVisibility failed:", err);
    const message = err instanceof Error ? err.message : "Could not update visibility.";
    return NextResponse.json(
      { error: message },
      { status: message === "Booking not found." ? 404 : 500 }
    );
  }
}
