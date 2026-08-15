"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Field, FieldContent, FieldLabel, FieldTitle } from "@/components/ui/field";
import { useBookingDraftStore, type BookingTraveler } from "@/stores/booking-draft-store";
import type { TripSummary } from "@/components/booking/booking-wizard";

const emptyTraveler: BookingTraveler = {
  name: "",
  age: "",
  relationship: "",
  healthNotes: [],
  dietaryNeeds: [],
};

export function StepDepartureTravelers({
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
  const addTraveler = useBookingDraftStore((s) => s.addTraveler);
  const removeTraveler = useBookingDraftStore((s) => s.removeTraveler);
  const [form, setForm] = useState<BookingTraveler>(emptyTraveler);
  const [error, setError] = useState<string | null>(null);

  function isFormFilled() {
    return form.name.trim() || form.age || form.relationship.trim();
  }

  function handleAddTraveler() {
    if (!form.name.trim() || !form.age || !form.relationship.trim()) {
      setError("Enter name, age and relationship before adding a traveler.");
      return;
    }
    addTraveler(form);
    setForm(emptyTraveler);
    setError(null);
  }

  function handleContinue() {
    if (!draft.tripDateId) {
      setError("Select a departure date.");
      return;
    }

    let travelerCount = draft.travelers.length;
    if (isFormFilled()) {
      if (!form.name.trim() || !form.age || !form.relationship.trim()) {
        setError("Enter name, age and relationship before adding a traveler.");
        return;
      }
      addTraveler(form);
      setForm(emptyTraveler);
      travelerCount += 1;
    }

    if (travelerCount === 0) {
      setError("Add at least one traveler.");
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Departure &amp; travelers</h1>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Select departure date
      </p>
      {trip.dates.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No upcoming departures available for this trip.</p>
      ) : (
        <RadioGroup
          value={draft.tripDateId ?? undefined}
          onValueChange={(value) => update({ tripDateId: value })}
          aria-label="Departure date"
          className="mt-2 gap-2"
        >
          {trip.dates.map((d) => (
            <FieldLabel key={d.id} htmlFor={`trip-date-${d.id}`}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>
                    {new Date(d.departureDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </FieldTitle>
                  {d.seatsAvailable !== null && (
                    <span className="text-xs text-muted-foreground">{d.seatsAvailable} seats left</span>
                  )}
                </FieldContent>
                <RadioGroupItem value={d.id} id={`trip-date-${d.id}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      )}

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Travelers</p>
      {draft.travelers.length > 0 && (
        <ul className="mt-2 space-y-2" role="list">
          {draft.travelers.map((t, i) => (
            <li key={`${t.name}-${i}`}>
              <Card size="sm">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}, {t.age}</p>
                    <p className="text-xs text-muted-foreground">{t.relationship}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTraveler(i)}
                    aria-label={`Remove ${t.name}`}
                    className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Input
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          aria-label="Traveler name"
        />
        <Input
          type="number"
          placeholder="Age"
          min={1}
          max={120}
          value={form.age}
          onChange={(e) => setForm((f) => ({ ...f, age: e.target.value ? Number(e.target.value) : "" }))}
          aria-label="Traveler age"
        />
        <Input
          placeholder="Relationship to you"
          value={form.relationship}
          onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
          aria-label="Relationship to you"
          className="col-span-2"
        />
      </div>
      <Button type="button" variant="outline" className="mt-2 w-full min-h-11" onClick={handleAddTraveler}>
        <Plus className="size-4" aria-hidden="true" />
        Add traveler
      </Button>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" className="flex-1 min-h-11" onClick={onBack}>
          Back
        </Button>
        <Button type="button" className="flex-1 min-h-11" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
