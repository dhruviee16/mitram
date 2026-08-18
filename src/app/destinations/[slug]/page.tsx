import { notFound } from "next/navigation";
import Image from "next/image";
import { getDestinationBySlug } from "@/server/services/destinationService";
import { searchTrips } from "@/server/services/tripService";
import { TripCard } from "@/components/trip/trip-card";

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const trips = await searchTrips({ destination: slug });

  return (
    <div>
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        {destination.heroImage ? (
          <Image src={destination.heroImage} alt="" fill sizes="100vw" className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary to-foreground" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6 sm:px-6">
          <h1 className="font-heading text-3xl font-bold text-white">{destination.name}</h1>
          {destination.bestTime && (
            <p className="mt-1 text-sm text-white/85">Best time to visit: {destination.bestTime}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {destination.description && (
          <p className="max-w-2xl text-sm leading-relaxed text-foreground">{destination.description}</p>
        )}

        <h2 className="mt-8 font-heading text-xl font-bold text-foreground">
          MITRAM trips in {destination.name}
        </h2>
        {trips.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No trips are live in {destination.name} right now. Check back soon.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {trips.map((trip) => (
              <li key={trip.slug}>
                <TripCard trip={trip} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
