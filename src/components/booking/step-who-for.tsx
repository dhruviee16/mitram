"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BookedFor } from "@/lib/validations/booking";

const options: { value: BookedFor; label: string; description: string }[] = [
  { value: "self", label: "Myself", description: "I'm the one traveling." },
  { value: "parent", label: "My parent", description: "Booking and paying for a parent." },
  { value: "nri", label: "NRI booking from abroad", description: "I live outside India." },
];

export function StepWhoFor({
  value,
  onNext,
}: {
  value: BookedFor | null;
  onNext: (value: BookedFor) => void;
}) {
  const [selected, setSelected] = useState<BookedFor | null>(value);

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Who&rsquo;s this trip for?</h1>
      <div className="mt-4 space-y-2" role="radiogroup" aria-label="Who is this trip for">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected === opt.value}
            onClick={() => setSelected(opt.value)}
            className={
              selected === opt.value
                ? "block w-full rounded-lg border-2 border-primary bg-secondary/40 p-4 text-left"
                : "block w-full rounded-lg border border-border p-4 text-left hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            <p className="text-sm font-semibold text-foreground">{opt.label}</p>
            <p className="text-xs text-muted-foreground">{opt.description}</p>
          </button>
        ))}
      </div>
      <Button
        type="button"
        className="mt-6 w-full"
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
      >
        Continue
      </Button>
    </div>
  );
}
