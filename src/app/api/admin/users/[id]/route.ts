import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { setUserRole } from "@/server/services/adminService";

const bodySchema = z.object({
  role: z.enum(["traveler", "vendor", "admin", "operations", "coordinator"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await params;
  if (id === session?.user?.id) {
    return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const user = await setUserRole(id, parsed.data.role);
  return NextResponse.json({ id: user.id, role: user.role });
}
