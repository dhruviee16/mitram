import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { listAllReviews } from "@/server/services/reviewService";
import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type ReviewRow = Awaited<ReturnType<typeof listAllReviews>>[number];

export default async function AdminReviewsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    redirect("/customer/login");
  }

  const reviews = await listAllReviews();

  const columns: DataTableColumn<ReviewRow>[] = [
    {
      header: "Review",
      className: "max-w-md whitespace-normal align-top",
      cell: (r) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{r.user.name}</p>
            <StarRating value={r.rating} readOnly size="sm" />
            {r.images.length > 0 && <Badge variant="secondary">{r.images.length} photo{r.images.length === 1 ? "" : "s"}</Badge>}
          </div>
          {r.comment && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.comment}</p>}
          <p className="mt-1 text-xs text-muted-foreground">{r.trip.title}</p>
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right whitespace-nowrap",
      className: "text-right whitespace-nowrap align-top",
      cell: (r) => (
        <Button variant="outline" size="sm" render={<Link href={`/admin/reviews/${r.id}`} />}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <AdminNav active="/admin/reviews" />
      <h1 className="font-heading text-2xl font-bold text-foreground">Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Reviews shown on trip pages. Edit rating, comment, or photos.
      </p>

      <div className="mt-6">
        <DataTable columns={columns} data={reviews} rowKey={(r) => r.id} emptyMessage="No reviews yet." />
      </div>
    </div>
  );
}
