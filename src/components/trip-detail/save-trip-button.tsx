"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useToggleSavedTrip } from "@/hooks/use-toggle-saved-trip";

export function SaveTripButton({ tripId, initialSaved }: { tripId: string; initialSaved: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const toggle = useToggleSavedTrip();

  async function handleClick() {
    if (!session?.user) {
      router.push(`/customer/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const next = !saved;
    setSaved(next);
    try {
      await toggle.mutateAsync({ tripId, saved: next });
      toast.success(next ? "Trip saved." : "Removed from saved trips.");
    } catch {
      setSaved(!next);
      toast.error("Could not update saved trips.");
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full min-h-11" onClick={handleClick}>
      <Heart className={saved ? "size-4 fill-primary text-primary" : "size-4"} aria-hidden="true" />
      {saved ? "Saved" : "Save trip"}
    </Button>
  );
}
