"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { useUpdateStatus } from "@/hooks/use-update-status";

export function StatusActionButtons({
  endpoint,
  actions,
}: {
  endpoint: string;
  actions: { label: string; status: string; variant?: "default" | "outline" | "destructive" }[];
}) {
  const router = useRouter();
  const { mutate, isPending } = useUpdateStatus();

  function handleClick(status: string) {
    mutate(
      { endpoint, status },
      {
        onSuccess: () => {
          toast.success("Status updated.");
          router.refresh();
        },
        onError: () => toast.error("Could not update status."),
      },
    );
  }

  return (
    <RowActionsMenu
      actions={actions.map((action) => ({
        label: action.label,
        variant: action.variant === "destructive" ? "destructive" : "default",
        disabled: isPending,
        onClick: () => handleClick(action.status),
      }))}
    />
  );
}
