import { useMutation } from "@tanstack/react-query";

async function startTrip(bookingId: string) {
  const res = await fetch(`/api/vendor/bookings/${bookingId}/start`, {
    method: "POST",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not start trip.");
  }
  return res.json();
}

export function useStartTrip() {
  return useMutation({ mutationFn: startTrip });
}
