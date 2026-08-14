"use client";

import { useEffect, useState } from "react";
import { StepIndicator } from "@/components/booking/step-indicator";
import { StepWhoFor } from "@/components/booking/step-who-for";
import { StepDepartureTravelers } from "@/components/booking/step-departure-travelers";
import { StepCareInsurance } from "@/components/booking/step-care-insurance";
import { StepContacts } from "@/components/booking/step-contacts";
import { StepReview } from "@/components/booking/step-review";
import { useBookingDraftStore } from "@/stores/booking-draft-store";

export type TripDateOption = {
  id: string;
  departureDate: string;
  returnDate: string | null;
  seatsAvailable: number | null;
};

export type TripSummary = {
  slug: string;
  title: string;
  routeSummary: string;
  basePrice: number;
  durationDays: number;
  durationNights: number;
  images: string[];
  insuranceIncluded: boolean;
  dates: TripDateOption[];
};

export function BookingWizard({ trip }: { trip: TripSummary }) {
  const [step, setStep] = useState(0);
  const draft = useBookingDraftStore((s) => s.draft);
  const startDraft = useBookingDraftStore((s) => s.startDraft);

  useEffect(() => {
    if (draft.tripSlug !== trip.slug) startDraft(trip.slug);
  }, [draft.tripSlug, trip.slug, startDraft]);

  if (draft.tripSlug !== trip.slug) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <StepIndicator current={step} />

      {step === 0 && <StepWhoFor onNext={() => setStep(1)} />}
      {step === 1 && (
        <StepDepartureTravelers trip={trip} onBack={() => setStep(0)} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <StepCareInsurance trip={trip} onBack={() => setStep(1)} onNext={() => setStep(3)} />
      )}
      {step === 3 && <StepContacts onBack={() => setStep(2)} onNext={() => setStep(4)} />}
      {step === 4 && <StepReview trip={trip} onBack={() => setStep(3)} />}
    </div>
  );
}
