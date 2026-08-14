"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldContent, FieldLabel, FieldTitle, FieldDescription } from "@/components/ui/field";
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
      <RadioGroup
        value={bookedFor ?? undefined}
        onValueChange={(value) => update({ bookedFor: value as BookedFor })}
        aria-label="Who is this trip for"
        className="mt-4 gap-2"
      >
        {options.map((opt) => (
          <FieldLabel key={opt.value} htmlFor={`booked-for-${opt.value}`}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{opt.label}</FieldTitle>
                <FieldDescription>{opt.description}</FieldDescription>
              </FieldContent>
              <RadioGroupItem value={opt.value} id={`booked-for-${opt.value}`} />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
      <Button type="button" className="mt-6 w-full min-h-11" disabled={!bookedFor} onClick={onNext}>
        Continue
      </Button>
    </div>
  );
}
