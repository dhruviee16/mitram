import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getReviewById } from "@/server/services/reviewService";
import { AdminNav } from "@/components/admin/admin-nav";
import { ReviewForm } from "@/components/admin/review-form";

export default async function AdminEditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const { id } = await params;
  const review = await getReviewById(id);
  if (!review) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/reviews" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Edit review</h1>
      <p className="mt-1 text-sm text-muted-foreground">{review.trip.title}</p>

      <div className="mt-6">
        <ReviewForm
          id={review.id}
          defaultValues={{
            rating: review.rating,
            comment: review.comment ?? "",
            images: review.images,
          }}
        />
      </div>
    </div>
  );
}
