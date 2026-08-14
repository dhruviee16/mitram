"use client";

import { Button } from "@/components/ui/button";
import { useBookingDraftStore } from "@/stores/booking-draft-store";
import type { BookedFor } from "@/lib/validations/booking";

const options: { value: BookedFor; label: string; description: string }[] = [
  { value: "self", label: "Myself", description: "I'm the one traveling." },
  { value: "parent", label: "My parent", description: "Booking and paying for a parent." },
  { value: "nri", label: "NRI booking from abroad", description: "I live outside India." },
];

export function StepWhoFor({ onNext }: { onNext: () => void }) {
  const bookedFor = useBookingDraftStore((s) => s.draft.bookedFor);
  const update = useBookingDraftStore((s) => s.update);

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Who&rsquo;s this trip for?</h1>
      <div className="mt-4 space-y-2" role="radiogroup" aria-label="Who is this trip for">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={bookedFor === opt.value}
            onClick={() => update({ bookedFor: opt.value })}
            className={
              bookedFor === opt.value
                ? "block w-full rounded-lg border-2 border-primary bg-secondary/40 p-4 text-left"
                : "block w-full rounded-lg border border-border p-4 text-left hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            <p className="text-sm font-semibold text-foreground">{opt.label}</p>
            <p className="text-xs text-muted-foreground">{opt.description}</p>
          </button>
        ))}
      </div>
      <Button type="button" className="mt-6 w-full min-h-11" disabled={!bookedFor} onClick={onNext}>
        Continue
      </Button>
    </div>
  );
}
