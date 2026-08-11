"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStartTrip } from "@/hooks/use-start-trip";

export function StartTripButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { mutate, isPending } = useStartTrip();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        mutate(bookingId, {
          onSuccess: () => {
            toast.success("Trip started. Live tracking is now on.");
            router.refresh();
          },
          onError: (err) => toast.error(err.message),
        })
      }
    >
      {isPending ? "Starting..." : "Start trip"}
    </Button>
  );
}
