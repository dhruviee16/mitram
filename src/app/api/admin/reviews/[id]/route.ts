import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { updateReview, deleteReview } from "@/server/services/reviewService";

const bodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().optional().or(z.literal("")),
  images: z.array(z.string()).default([]),
});

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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const review = await updateReview(id, {
    rating: parsed.data.rating,
    comment: parsed.data.comment || null,
    images: parsed.data.images,
  });
  return NextResponse.json(review);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  await deleteReview(id);
  return NextResponse.json({ deleted: true });
}
