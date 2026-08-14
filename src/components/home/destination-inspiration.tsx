import Image from "next/image";
import Link from "next/link";

const destinations = [
  {
    label: "Gujarat & Rann of Kutch",
    href: "/trips?q=Kutch",
    image: "/images/trips/dwarka-rann-of-kutch-1.jpg",
  },
  {
    label: "Maharashtra Jyotirlinga Trail",
    href: "/trips?q=Maharashtra",
    image: "/images/trips/maharashtra-jyotirlinga-circuit.jpg",
  },
  {
    label: "Jharkhand — Sammed Shikharji",
    href: "/trips?q=Shikharji",
    image: "/images/trips/sammed-shikharji-yatra.jpg",
  },
  {
    label: "Uttarakhand — Char Dham",
    href: "/trips?q=Char+Dham",
    image: null,
  },
];

export function DestinationInspiration() {
  return (
    <section className="px-4 pt-2 pb-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Where families are going this season
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {destinations.map((destination) => (
            <Link
              key={destination.label}
              href={destination.href}
              className="relative flex h-[170px] items-end overflow-hidden rounded-xl p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {destination.image ? (
                <Image
                  src={destination.image}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-primary to-[#5c1010]" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/65 to-transparent to-60%" />
              <span className="relative font-heading text-[15px] font-bold text-white">
                {destination.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
