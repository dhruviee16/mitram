import Link from "next/link";
import Image from "next/image";
import { listDestinations } from "@/server/services/destinationService";

export const metadata = { title: "Destinations | MITRAM" };

export default async function DestinationsPage() {
  const destinations = await listDestinations();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-foreground">Destinations</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every destination page uses real, destination-specific imagery, never generic stock.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <Link
            key={d.slug}
            href={`/destinations/${d.slug}`}
            className="group relative flex h-40 items-end overflow-hidden rounded-xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {d.heroImage ? (
              <Image src={d.heroImage} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-primary to-foreground" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/65 to-transparent to-60%" />
            <div className="relative">
              <span className="font-heading text-base font-bold text-white">{d.name}</span>
              <span className="block text-xs text-white/80">
                {d._count.trips} trip{d._count.trips === 1 ? "" : "s"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
