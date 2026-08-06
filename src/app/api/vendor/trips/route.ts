import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { vendorTripSchema } from "@/lib/validations/vendor";
import { createTrip } from "@/server/services/vendorService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    return NextResponse.json({ error: "Not signed in as a vendor." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = vendorTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const result = await createTrip(session.user.id, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("createTrip failed:", err);
    return NextResponse.json({ error: "Could not create trip." }, { status: 500 });
  }
}
