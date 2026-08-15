"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RowActionsMenu } from "@/components/ui/row-actions-menu";
import { useUpdateUserRole } from "@/hooks/use-update-user-role";

export function UserRoleActions({ id, role }: { id: string; role: string }) {
  const router = useRouter();
  const { mutate, isPending } = useUpdateUserRole();

  function setRole(nextRole: string) {
    mutate(
      { id, role: nextRole },
      {
        onSuccess: () => {
          toast.success("Role updated.");
          router.refresh();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update role."),
      },
    );
  }

  const actions =
    role === "admin"
      ? [{ label: "Remove admin", onClick: () => setRole("traveler"), variant: "destructive" as const, disabled: isPending }]
      : [{ label: "Make admin", onClick: () => setRole("admin"), disabled: isPending }];

  return <RowActionsMenu actions={actions} />;
}
