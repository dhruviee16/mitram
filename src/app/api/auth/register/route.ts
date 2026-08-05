import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations/auth";
import { registerUser, DuplicateEmailError } from "@/server/services/authService";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const user = await registerUser(
      parsed.data.email,
      parsed.data.password,
      parsed.data.name
    );
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("registerUser failed:", err);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
