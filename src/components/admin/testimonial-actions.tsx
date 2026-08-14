"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { patchJson, deleteJson } from "@/lib/api";

export function TestimonialActions({ id, featured }: { id: string; featured: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function toggleFeatured() {
    setSubmitting(true);
    try {
      await patchJson(`/api/admin/testimonials/${id}`, { featured: !featured });
      toast.success("Updated.");
      router.refresh();
    } catch {
      toast.error("Could not update.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      await deleteJson(`/api/admin/testimonials/${id}`);
      toast.success("Removed.");
      router.refresh();
    } catch {
      toast.error("Could not remove.");
    } finally {
      setSubmitting(false);
    }
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
