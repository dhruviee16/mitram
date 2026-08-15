import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { vendorTripUpdateSchema } from "@/lib/validations/vendor";
import { postTripUpdate } from "@/server/services/vendorService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "vendor" && role !== "admin")) {
    return NextResponse.json({ error: "Not signed in as a vendor." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = vendorTripUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const update = await postTripUpdate(id, session.user.id, parsed.data);
    return NextResponse.json(update, { status: 201 });
  } catch (err) {
    console.error("postTripUpdate failed:", err);
    const message = err instanceof Error ? err.message : "Could not post update.";
    const status = message === "Booking not found." ? 404 : message === "Booking is not ongoing." ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
