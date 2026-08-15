import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createDestination } from "@/server/services/destinationService";

const schema = z.object({ name: z.string().trim().min(2, "Enter a destination name.") });

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || (role !== "vendor" && role !== "admin")) {
    return NextResponse.json({ error: "Not signed in as a vendor." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const destination = await createDestination(parsed.data.name);
  return NextResponse.json(destination, { status: 201 });
}
