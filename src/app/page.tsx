import { TripCard } from "@/components/trip/trip-card";
import { listTrips } from "@/server/services/tripService";

export default async function Home() {
  const trips = await listTrips();

  return (
    <div className="mx-auto grid max-w-6xl gap-4 p-8 sm:grid-cols-3">
      {trips.map((trip) => (
        <TripCard key={trip.slug} trip={trip} />
      ))}
    </div>
  );
}
