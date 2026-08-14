import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { familyConnectionSchema } from "@/lib/validations/family";
import { listFamilyConnections, createFamilyConnection } from "@/server/services/familyService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const connections = await listFamilyConnections(session.user.id);
  return NextResponse.json(connections);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = familyConnectionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const connection = await createFamilyConnection(session.user.id, parsed.data);
  return NextResponse.json(connection, { status: 201 });
}
