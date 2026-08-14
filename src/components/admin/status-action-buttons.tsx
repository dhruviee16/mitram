"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { patchJson } from "@/lib/api";

export function StatusActionButtons({
  endpoint,
  actions,
}: {
  endpoint: string;
  actions: { label: string; status: string; variant?: "default" | "outline" | "destructive" }[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);

  async function handleClick(status: string) {
    setSubmitting(status);
    try {
      await patchJson(endpoint, { status });
      toast.success("Status updated.");
      router.refresh();
    } catch {
      toast.error("Could not update status.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          size="sm"
          variant={action.variant ?? "outline"}
          disabled={submitting !== null}
          onClick={() => handleClick(action.status)}
        >
          {submitting === action.status ? "Saving..." : action.label}
        </Button>
      ))}
    </div>
  );
}
