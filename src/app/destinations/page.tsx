import { listPublishedDestinations } from "@/server/services/destinationService";
import { DestinationCard } from "@/components/destinations/destination-card";

export const metadata = { title: "Destinations | MITRAM" };

export default async function DestinationsPage() {
  const destinations = await listPublishedDestinations();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Destinations</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every destination page uses real, destination-specific imagery, never generic stock.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {destinations.map((d) => (
          <DestinationCard key={d.slug} destination={d} />
        ))}
      </div>
    </div>
  );
}
