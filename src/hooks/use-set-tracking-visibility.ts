import { useMutation } from "@tanstack/react-query";

type Input = { bookingId: string; visible: boolean };
type Result = { trackingVisible: boolean };

async function patchVisibility({ bookingId, visible }: Input): Promise<Result> {
  const res = await fetch(`/api/bookings/${bookingId}/tracking-visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visible }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not update visibility.");
  }
  return res.json();
}

export function useSetTrackingVisibility() {
  return useMutation({ mutationFn: patchVisibility });
}
