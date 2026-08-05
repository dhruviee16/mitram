"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/booking/step-indicator";
import { StepWhoFor } from "@/components/booking/step-who-for";
import { StepTraveler } from "@/components/booking/step-traveler";
import type { BookedFor, TravelerValues, RoomCareValues } from "@/lib/validations/booking";

export type WizardState = {
  bookedFor: BookedFor | null;
  traveler: TravelerValues | null;
  roomCare: RoomCareValues | null;
};

export type TripSummary = {
  slug: string;
  title: string;
  routeSummary: string;
  basePrice: number;
  durationDays: number;
  durationNights: number;
  images: string[];
};

export function BookingWizard({ trip }: { trip: TripSummary }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    bookedFor: null,
    traveler: null,
    roomCare: null,
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <StepIndicator current={step} />

      {step === 0 && (
        <StepWhoFor
          value={state.bookedFor}
          onNext={(bookedFor) => {
            setState((s) => ({ ...s, bookedFor }));
            setStep(1);
          }}
        />
      )}

      {step === 1 && (
        <StepTraveler
          bookedFor={state.bookedFor!}
          value={state.traveler}
          onBack={() => setStep(0)}
          onNext={(traveler) => {
            setState((s) => ({ ...s, traveler }));
            setStep(2);
          }}
        />
      )}

      {/* Steps 2 (room/care) and 3 (review) are added in Task 4 */}
    </div>
  );
}
