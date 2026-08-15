import { useMutation } from "@tanstack/react-query";
import { postJson, putJson } from "@/lib/api";

export function useSaveVendorTrip() {
  return useMutation({
    mutationFn: ({
      mode,
      tripId,
      values,
    }: {
      mode: "create" | "edit";
      tripId?: string;
      values: Record<string, unknown>;
    }) =>
      mode === "create"
        ? postJson("/api/vendor/trips", values)
        : putJson(`/api/vendor/trips/${tripId}`, values),
  });
}
