"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDeleteReview } from "@/hooks/use-delete-review";

export function ReviewActions({ id }: { id: string }) {
  const router = useRouter();
  const deleteReview = useDeleteReview();

  function handleDelete() {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    deleteReview.mutate(id, {
      onSuccess: () => {
        toast.success("Review deleted.");
        router.refresh();
      },
      onError: () => toast.error("Could not delete review."),
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" render={<Link href={`/admin/reviews/${id}`} />}>
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        disabled={deleteReview.isPending}
        onClick={handleDelete}
      >
        Delete
      </Button>
    </div>
  );
}
