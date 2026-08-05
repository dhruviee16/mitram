type TripDay = {
  dayNumber: number;
  title: string;
  description: string;
  activities: string[];
};

export function ItinerarySection({
  days,
  summary,
  inclusions,
}: {
  days: TripDay[];
  summary: string;
  inclusions: string[];
}) {
  if (days.length === 0) {
    return (
      <section aria-labelledby="itinerary-heading">
        <h2 id="itinerary-heading" className="font-heading text-xl font-bold text-foreground">
          About this trip
        </h2>
        <p className="mt-3 text-sm text-foreground">{summary}</p>
        {inclusions.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-foreground">What&rsquo;s included</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground" role="list">
              {inclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    );
  }

  return (
    <section aria-labelledby="itinerary-heading">
      <h2 id="itinerary-heading" className="font-heading text-xl font-bold text-foreground">
        Day-by-day itinerary
      </h2>
      <ol className="mt-4 space-y-6">
        {days.map((day) => (
          <li key={day.dayNumber} className="border-l-2 border-primary/30 pl-4">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Day {day.dayNumber} — {day.title}
            </p>
            <p className="mt-1 text-sm text-foreground">{day.description}</p>
            {day.activities.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground" role="list">
                {day.activities.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
