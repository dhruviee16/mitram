"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { useSetTestimonialFeatured, useDeleteTestimonial } from "@/hooks/use-testimonial-actions";

export function TestimonialActions({ id, featured }: { id: string; featured: boolean }) {
  const router = useRouter();
  const setFeatured = useSetTestimonialFeatured();
  const deleteTestimonial = useDeleteTestimonial();
  const submitting = setFeatured.isPending || deleteTestimonial.isPending;

  function toggleFeatured() {
    setFeatured.mutate(
      { id, featured: !featured },
      {
        onSuccess: () => {
          toast.success("Updated.");
          router.refresh();
        },
        onError: () => toast.error("Could not update."),
      },
    );
  }

  function handleDelete() {
    deleteTestimonial.mutate(id, {
      onSuccess: () => {
        toast.success("Removed.");
        router.refresh();
      },
      onError: () => toast.error("Could not remove."),
    });
  }

  return (
    <RowActionsMenu
      actions={[
        { label: featured ? "Unfeature" : "Feature", onClick: toggleFeatured, disabled: submitting },
        { label: "Delete", onClick: handleDelete, variant: "destructive", disabled: submitting },
      ]}
    />
  );
}
