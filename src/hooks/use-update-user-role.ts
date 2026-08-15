import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/api";

export function useUpdateUserRole() {
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      patchJson(`/api/admin/users/${id}`, { role }),
  });
}
