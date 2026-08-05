type TripDay = {
  dayNumber: number;
  title: string;
  description: string;
};

export function ItineraryRecap({ days }: { days: TripDay[] }) {
  if (days.length === 0) return null;

  return (
    <section aria-labelledby="itinerary-recap-heading">
      <h2 id="itinerary-recap-heading" className="text-sm font-semibold text-foreground">
        Itinerary
      </h2>
      <ol className="mt-3 space-y-3">
        {days.map((day) => (
          <li key={day.dayNumber} className="flex gap-3 border-l-2 border-primary/30 pl-3 text-sm">
            <span className="shrink-0 font-heading font-bold text-primary">Day {day.dayNumber}</span>
            <div>
              <p className="font-semibold text-foreground">{day.title}</p>
              <p className="text-muted-foreground">{day.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
