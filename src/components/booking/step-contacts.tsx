"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { useBookingDraftStore } from "@/stores/booking-draft-store";

export function StepContacts({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const draft = useBookingDraftStore((s) => s.draft);
  const update = useBookingDraftStore((s) => s.update);
  const [error, setError] = useState<string | null>(null);

  function handleContinue() {
    if (!draft.emergencyContactName.trim() || !draft.emergencyContactPhone.trim()) {
      setError("Enter an emergency contact name and phone number.");
      return;
    }
    if (draft.linkFamilyContact && !draft.familyContactName.trim()) {
      setError("Enter a name for the family member you're linking, or turn off family linking.");
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-foreground">Emergency &amp; family contact</h1>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Emergency contact
      </p>
      <div className="mt-2 space-y-2">
        <Input
          placeholder="Full name"
          value={draft.emergencyContactName}
          onChange={(e) => update({ emergencyContactName: e.target.value })}
          aria-label="Emergency contact name"
        />
        <Input
          type="tel"
          placeholder="Phone number"
          value={draft.emergencyContactPhone}
          onChange={(e) => update({ emergencyContactPhone: e.target.value })}
          aria-label="Emergency contact phone"
        />
        <Input
          placeholder="Relationship"
          value={draft.emergencyContactRelation}
          onChange={(e) => update({ emergencyContactRelation: e.target.value })}
          aria-label="Emergency contact relationship"
        />
      </div>

      <FieldLabel htmlFor="link-family-contact" className="mt-6">
        <Field orientation="horizontal">
          <Checkbox
            id="link-family-contact"
            checked={draft.linkFamilyContact}
            onCheckedChange={(checked) => update({ linkFamilyContact: checked === true })}
          />
          <FieldTitle className="font-normal">Link a family member for trip updates</FieldTitle>
        </Field>
      </FieldLabel>
      <p className="mt-1 text-xs text-muted-foreground">
        Miles apart. Still connected. Your family can see trip status, photos and live
        location, you control exactly what&apos;s shared.
      </p>

      {draft.linkFamilyContact && (
        <div className="mt-3 space-y-2">
          <Input
            placeholder="Family member's name"
            value={draft.familyContactName}
            onChange={(e) => update({ familyContactName: e.target.value })}
            aria-label="Family contact name"
          />
          <Input
            placeholder="Relationship (e.g. Son, Daughter)"
            value={draft.familyContactRelationship}
            onChange={(e) => update({ familyContactRelationship: e.target.value })}
            aria-label="Family contact relationship"
          />
          <Input
            type="email"
            placeholder="Email"
            value={draft.familyContactEmail}
            onChange={(e) => update({ familyContactEmail: e.target.value })}
            aria-label="Family contact email"
          />
          <Input
            type="tel"
            placeholder="Phone number"
            value={draft.familyContactPhone}
            onChange={(e) => update({ familyContactPhone: e.target.value })}
            aria-label="Family contact phone"
          />
        </div>
      )}

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
