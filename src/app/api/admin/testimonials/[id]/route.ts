import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { setTestimonialFeatured, deleteTestimonial } from "@/server/services/adminService";

const bodySchema = z.object({ featured: z.boolean() });

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
  const testimonial = await setTestimonialFeatured(id, parsed.data.featured);
  return NextResponse.json(testimonial);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  await deleteTestimonial(id);
  return NextResponse.json({ deleted: true });
}
