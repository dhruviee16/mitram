import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { setVendorVerification } from "@/server/services/adminService";

const bodySchema = z.object({
  status: z.enum(["pending", "under_review", "verified", "rejected", "suspended"]),
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

  const vendor = await setVendorVerification(id, parsed.data.status);
  return NextResponse.json(vendor);
}
