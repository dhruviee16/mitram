import { CalendarDays, MapPin, Users, Footprints, Star, UtensilsCrossed, ShieldCheck, Heart } from "lucide-react";

type QuickInfoTrip = {
  durationDays: number;
  durationNights: number;
  groupSizeMin: number | null;
  groupSizeMax: number | null;
  ageGroupMin: number | null;
  ageGroupMax: number | null;
  walkingIntensity: string;
  hotelCategory: number | null;
  mealsPlan: string[];
  insuranceIncluded: boolean;
  coordinatorIncluded: boolean;
  destination: { name: string } | null;
};

const WALKING_LABEL: Record<string, string> = { easy: "Easy", moderate: "Moderate", challenging: "Challenging" };

export function QuickInfo({ trip }: { trip: QuickInfoTrip }) {
  const items = [
    { icon: CalendarDays, label: "Duration", value: `${trip.durationDays}D / ${trip.durationNights}N` },
    trip.destination && { icon: MapPin, label: "Destination", value: trip.destination.name },
    trip.groupSizeMin && trip.groupSizeMax && {
      icon: Users,
      label: "Group Size",
      value: `${trip.groupSizeMin}–${trip.groupSizeMax} travellers`,
    },
    trip.ageGroupMin && trip.ageGroupMax && {
      icon: Heart,
      label: "Age Group",
      value: `${trip.ageGroupMin}–${trip.ageGroupMax} years`,
    },
    { icon: Footprints, label: "Walking Level", value: WALKING_LABEL[trip.walkingIntensity] ?? trip.walkingIntensity },
    trip.hotelCategory && { icon: Star, label: "Hotel Category", value: `${trip.hotelCategory}-star` },
    trip.mealsPlan.length > 0 && {
      icon: UtensilsCrossed,
      label: "Meals",
      value: trip.mealsPlan.length === 3 ? "Breakfast, Lunch & Dinner" : trip.mealsPlan.join(", "),
    },
    { icon: ShieldCheck, label: "Insurance", value: trip.insuranceIncluded ? "Included" : "Available on request" },
    { icon: Users, label: "Coordinator", value: trip.coordinatorIncluded ? "MITRAM coordinator included" : "Not included" },
  ].filter(Boolean) as { icon: typeof CalendarDays; label: string; value: string }[];

  return (
    <section aria-labelledby="quick-info-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 id="quick-info-heading" className="font-heading text-lg font-bold text-foreground">
        Quick Information
      </h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-semibold text-foreground">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
