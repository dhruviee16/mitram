import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { reviewSchema } from "@/lib/validations/review";
import { createReview } from "@/server/services/reviewService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const review = await createReview(session.user.id, parsed.data);
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not submit review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
