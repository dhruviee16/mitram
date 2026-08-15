import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/api";

export function useUpdateStatus() {
  return useMutation({
    mutationFn: ({ endpoint, status }: { endpoint: string; status: string }) =>
      patchJson(endpoint, { status }),
  });
}
