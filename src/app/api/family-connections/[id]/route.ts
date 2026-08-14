import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { familyPermissionsSchema } from "@/lib/validations/family";
import { updateFamilyConnectionPermissions, deleteFamilyConnection } from "@/server/services/familyService";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = familyPermissionsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  try {
    const connection = await updateFamilyConnectionPermissions(id, session.user.id, parsed.data);
    return NextResponse.json(connection);
  } catch {
    return NextResponse.json({ error: "Family connection not found." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteFamilyConnection(id, session.user.id);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Family connection not found." }, { status: 404 });
  }
}
