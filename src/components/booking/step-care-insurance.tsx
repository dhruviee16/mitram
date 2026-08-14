"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldContent, FieldLabel, FieldTitle } from "@/components/ui/field";
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
      <RadioGroup
        value={draft.roomType ?? undefined}
        onValueChange={(value) => update({ roomType: value })}
        aria-label="Room type"
        className="mt-2 gap-2"
      >
        {roomTypes.map((opt) => (
          <FieldLabel key={opt.value} htmlFor={`room-type-${opt.value}`}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{opt.label}</FieldTitle>
              </FieldContent>
              <RadioGroupItem value={opt.value} id={`room-type-${opt.value}`} />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Special care requests
      </p>
      <div className="mt-2 space-y-2">
        {careOptions.map((option) => (
          <FieldLabel key={option} htmlFor={`care-${option}`}>
            <Field orientation="horizontal">
              <Checkbox
                id={`care-${option}`}
                checked={draft.specialCareRequests.includes(option)}
                onCheckedChange={() => toggleCare(option)}
              />
              <FieldTitle className="font-normal">{option}</FieldTitle>
            </Field>
          </FieldLabel>
        ))}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Travel insurance</p>
      {trip.insuranceIncluded ? (
        <Card className="mt-2 border-primary/30 bg-secondary/30" size="sm">
          <CardContent className="flex items-center gap-2.5 text-sm text-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
            Travel insurance is included with this trip.
          </CardContent>
        </Card>
      ) : (
        <FieldLabel htmlFor="insurance-opt-in" className="mt-2">
          <Field orientation="horizontal">
            <Checkbox
              id="insurance-opt-in"
              checked={draft.insuranceOpted}
              onCheckedChange={(checked) => update({ insuranceOpted: checked === true })}
            />
            <FieldTitle className="font-normal">Add travel insurance</FieldTitle>
          </Field>
        </FieldLabel>
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
