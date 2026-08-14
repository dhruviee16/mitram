"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingDraftStore } from "@/stores/booking-draft-store";
import type { TripSummary } from "@/components/booking/booking-wizard";

const roomTypes = [
  { value: "single", label: "Single occupancy" },
  { value: "twin", label: "Twin sharing" },
  { value: "triple", label: "Triple sharing" },
];

const careOptions = [
  "BP & sugar monitoring",
  "Wheelchair assist",
  "Dedicated companion",
  "Dietary accommodation",
];

export function StepCareInsurance({
  trip,
  onBack,
  onNext,
}: {
  trip: TripSummary;
  onBack: () => void;
  onNext: () => void;
}) {
  const draft = useBookingDraftStore((s) => s.draft);
  const update = useBookingDraftStore((s) => s.update);

  function toggleCare(option: string) {
    const next = draft.specialCareRequests.includes(option)
      ? draft.specialCareRequests.filter((c) => c !== option)
      : [...draft.specialCareRequests, option];
    update({ specialCareRequests: next });
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Room, care &amp; insurance</h1>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Room type</p>
      <div className="mt-2 space-y-2" role="radiogroup" aria-label="Room type">
        {roomTypes.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={draft.roomType === opt.value}
            onClick={() => update({ roomType: opt.value })}
            className={
              draft.roomType === opt.value
                ? "block w-full rounded-lg border-2 border-primary bg-secondary/40 p-3 text-left text-sm font-semibold text-foreground"
                : "block w-full rounded-lg border border-border p-3 text-left text-sm text-foreground hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Special care requests
      </p>
      <div className="mt-2 space-y-2">
        {careOptions.map((option) => (
          <label key={option} className="flex min-h-11 items-center gap-2.5 rounded-lg border border-border p-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={draft.specialCareRequests.includes(option)}
              onChange={() => toggleCare(option)}
              className="size-[18px] accent-primary"
            />
            {option}
          </label>
        ))}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Travel insurance</p>
      {trip.insuranceIncluded ? (
        <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-primary/30 bg-secondary/30 p-3 text-sm text-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
          Travel insurance is included with this trip.
        </div>
      ) : (
        <label className="mt-2 flex min-h-11 items-center gap-2.5 rounded-lg border border-border p-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={draft.insuranceOpted}
            onChange={(e) => update({ insuranceOpted: e.target.checked })}
            className="size-[18px] accent-primary"
          />
          Add travel insurance
        </label>
      )}

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" className="flex-1 min-h-11" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          className="flex-1 min-h-11"
          disabled={!draft.roomType}
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
