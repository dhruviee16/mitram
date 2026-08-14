"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
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
    <RowActionsMenu
      actions={actions.map((action) => ({
        label: action.label,
        variant: action.variant === "destructive" ? "destructive" : "default",
        disabled: submitting !== null,
        onClick: () => handleClick(action.status),
      }))}
    />
  );
}
