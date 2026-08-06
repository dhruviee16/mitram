import { useMutation } from "@tanstack/react-query";
import type { VendorTripUpdateValues } from "@/lib/validations/vendor";

type Input = { bookingId: string; values: VendorTripUpdateValues };

async function postUpdate({ bookingId, values }: Input) {
  const res = await fetch(`/api/vendor/bookings/${bookingId}/updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not post update.");
  }
  return res.json();
}

export function usePostTripUpdate() {
  return useMutation({ mutationFn: postUpdate });
}
