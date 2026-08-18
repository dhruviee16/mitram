import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { updateDestination } from "@/server/services/destinationService";

const bodySchema = z.object({
  name: z.string().trim().min(2, "Enter a destination name."),
  state: z.string().trim().optional().or(z.literal("")),
  bestTime: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  heroImage: z.string().trim().optional().or(z.literal("")),
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

  const { name, state, bestTime, description, heroImage } = parsed.data;
  const destination = await updateDestination(id, {
    name,
    state: state || null,
    bestTime: bestTime || null,
    description: description || null,
    heroImage: heroImage || null,
  });
  return NextResponse.json(destination);
}
