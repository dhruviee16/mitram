import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/api";

export type DestinationInput = {
  name: string;
  state: string;
  bestTime: string;
  description: string;
  heroImage: string;
};

export function useUpdateDestination(id: string) {
  return useMutation({
    mutationFn: (values: DestinationInput) =>
      patchJson<{ id: string }>(`/api/admin/destinations/${id}`, values),
  });
}
