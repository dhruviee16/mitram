import { Suspense } from "react";
import { TripsBrowser } from "@/components/trips/trips-browser";
import { listTrips } from "@/server/services/tripService";

export default async function TripsPage() {
  const trips = await listTrips();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">All Yatras</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {trips.length} senior-assisted trips, every one with a verified companion.
      </p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <TripsBrowser trips={trips} />
        </Suspense>
      </div>
    </div>
  );
}
