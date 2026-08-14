import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { setTripStatus } from "@/server/services/adminService";

const bodySchema = z.object({
  status: z.enum(["draft", "pending_approval", "approved", "rejected", "paused"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const trip = await setTripStatus(id, parsed.data.status);
  return NextResponse.json(trip);
}
