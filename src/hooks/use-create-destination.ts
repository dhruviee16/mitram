import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/api";

export function useCreateDestination() {
  return useMutation({
    mutationFn: (name: string) =>
      postJson<{ id: string; name: string }>("/api/vendor/destinations", { name }),
  });
}
