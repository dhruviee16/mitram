import Image from "next/image";
import Link from "next/link";

type Destination = {
  slug: string;
  name: string;
  heroImage: string | null;
};

export function DestinationInspiration({ destinations }: { destinations: Destination[] }) {
  if (destinations.length === 0) return null;

  return (
    <section className="px-4 pt-2 pb-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Where families are going this season
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {destinations.map((destination) => (
            <Link
              key={destination.slug}
              href={`/destinations/${destination.slug}`}
              className="relative flex h-42.5 items-end overflow-hidden rounded-xl p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {destination.heroImage ? (
                <Image
                  src={destination.heroImage}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-primary to-foreground" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/65 to-transparent to-60%" />
              <span className="relative font-heading text-[15px] font-bold text-white">
                {destination.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
