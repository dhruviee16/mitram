import { TripCard } from "@/components/trip/trip-card";

type Trip = Parameters<typeof TripCard>[0]["trip"];

export function TripCarousel({ trips }: { trips: Trip[] }) {
  return (
    <section aria-labelledby="carousel-heading" className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 id="carousel-heading" className="font-heading text-xl font-bold text-foreground">
          Mitram&rsquo;s Most-Loved Yatras
        </h2>
        <ul className="mt-4 flex gap-4 overflow-x-auto pb-2" role="list">
          {trips.map((trip) => (
            <li key={trip.slug} className="w-64 shrink-0">
              <TripCard trip={trip} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
