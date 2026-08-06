import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { auth } from "@/auth";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    return NextResponse.json({ error: "Not signed in as a vendor." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or WebP images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "vendor-trips");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${session.user.id}-${nanoid(10)}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), bytes);

  return NextResponse.json({ url: `/uploads/vendor-trips/${filename}` }, { status: 201 });
}
