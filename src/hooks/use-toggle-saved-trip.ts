import { useMutation } from "@tanstack/react-query";
import { postJson, deleteJson } from "@/lib/api";

export function useToggleSavedTrip() {
  return useMutation({
    mutationFn: ({ tripId, saved }: { tripId: string; saved: boolean }) =>
      saved
        ? postJson<{ saved: boolean }>("/api/saved-trips", { tripId })
        : deleteJson<{ saved: boolean }>(`/api/saved-trips?tripId=${encodeURIComponent(tripId)}`),
  });
}
