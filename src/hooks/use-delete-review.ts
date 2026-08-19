import { useMutation } from "@tanstack/react-query";
import { deleteJson } from "@/lib/api";

export function useDeleteReview() {
  return useMutation({
    mutationFn: (id: string) => deleteJson(`/api/admin/reviews/${id}`),
  });
}
