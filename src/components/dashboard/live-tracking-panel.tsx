"use client";

import { useState } from "react";
import { MapPin, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useSetTrackingVisibility } from "@/hooks/use-set-tracking-visibility";

type TripUpdate = {
  id: string;
  timestamp: string | Date;
  locationLabel: string;
  note: string | null;
  healthBp: string | null;
  healthSugar: string | null;
  healthTemp: string | null;
  healthStatus: string | null;
};

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function LiveTrackingPanel({
  bookingId,
  trackingVisible,
  tripUpdates,
}: {
  bookingId: string;
  trackingVisible: boolean;
  tripUpdates: TripUpdate[];
}) {
  const [visible, setVisible] = useState(trackingVisible);
  const setTrackingVisibility = useSetTrackingVisibility();

  const latest = tripUpdates[tripUpdates.length - 1];

  function handleToggle(next: boolean) {
    setVisible(next);
    setTrackingVisibility.mutate(
      { bookingId, visible: next },
      {
        onError: () => {
          setVisible(!next);
          toast.error("Could not update visibility. Please try again.");
        },
      },
    );
  }

  return (
    <section aria-labelledby="tracking-heading" className="mt-6">
      <Card>
      <CardContent>
      <div className="flex items-center justify-between gap-4">
        <h2
          id="tracking-heading"
          className="text-sm font-semibold text-foreground"
        >
          Live Tracking
        </h2>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="tracking-visible-switch"
            className="text-xs text-muted-foreground"
          >
            Visible to you
          </Label>
          <Switch
            id="tracking-visible-switch"
            checked={visible}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        On by default so you can follow the trip as it happens — turn off any
        time to keep it more private.
      </p>

      {visible && latest && (
        <>
          <div className="relative mt-4 h-32 overflow-hidden rounded-lg bg-linear-to-br from-secondary via-primary/20 to-primary/40">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="absolute size-12 rounded-full border-2 border-primary/40 motion-safe:animate-ping" />
              <MapPin
                className="size-8 fill-primary text-primary-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2">
              <p className="text-xs font-semibold text-white">
                {latest.locationLabel}
              </p>
              <p className="text-[11px] text-white/80">
                Updated {relativeTime(new Date(latest.timestamp))}
              </p>
            </div>
          </div>

          <ol className="mt-4 space-y-4">
            {[...tripUpdates].reverse().map((update) => (
              <li
                key={update.id}
                className="flex gap-3 border-l-2 border-primary/30 pl-3 text-sm"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {update.locationLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {relativeTime(new Date(update.timestamp))}
                  </p>
                  {update.note && (
                    <p className="mt-1 text-muted-foreground">{update.note}</p>
                  )}
                  {(update.healthBp ||
                    update.healthSugar ||
                    update.healthTemp) && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <HeartPulse
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      />
                      {[update.healthBp, update.healthSugar, update.healthTemp]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {!visible && (
        <p className="mt-4 text-sm text-muted-foreground">
          Tracking is currently hidden. Turn it back on to see the latest
          updates.
        </p>
      )}
      </CardContent>
      </Card>
    </section>
  );
}
