"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
    <div className="flex shrink-0 gap-2">
      <Button type="button" size="sm" variant="outline" disabled={submitting} onClick={toggleFeatured}>
        {featured ? "Unfeature" : "Feature"}
      </Button>
      <Button type="button" size="sm" variant="destructive" disabled={submitting} onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
