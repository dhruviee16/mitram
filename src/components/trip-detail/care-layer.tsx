import { CheckCircle2 } from "lucide-react";

type CareLayerTrip = {
  coordinatorIncluded: boolean;
  insuranceIncluded: boolean;
  walkingIntensity: string;
};

export function CareLayer({ trip }: { trip: CareLayerTrip }) {
  const items = [
    trip.coordinatorIncluded && "Dedicated MITRAM coordinator throughout the journey",
    "Family trip updates where enabled",
    "Slow-paced, senior-friendly itinerary",
    trip.walkingIntensity !== "challenging" && "Mobility assistance where available",
    "Wellness support on applicable trips — operational support, not a substitute for professional medical care",
    "Emergency escalation plan",
    trip.insuranceIncluded && "Travel insurance included",
    "Group companionship with fellow senior travellers",
  ].filter(Boolean) as string[];

  return (
    <section aria-labelledby="care-layer-heading" className="rounded-2xl border border-primary/30 bg-secondary/30 p-5 shadow-sm">
      <h2 id="care-layer-heading" className="font-heading text-lg font-bold text-foreground">
        Your MITRAM Care Layer
      </h2>
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2" role="list">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
