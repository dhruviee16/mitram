import Link from "next/link";
import { Flame, Landmark, Mountain, Globe, PartyPopper, ArrowRight } from "lucide-react";

const categories = [
  { href: "/trips?category=spiritual", label: "Spiritual Journeys", icon: Flame },
  { href: "/trips?category=heritage", label: "Heritage & Culture", icon: Landmark },
  { href: "/trips?category=nature-wildlife", label: "Nature & Wildlife", icon: Mountain },
  { href: "/trips?category=leisure", label: "Leisure & Fun", icon: Globe },
  { href: "/trips?category=festival", label: "Festival Trips", icon: PartyPopper },
];

export function BrowseCategories() {
  return (
    <section className="px-4 pt-10 pb-2 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Browse by kind of journey
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-5 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-foreground">{label}</span>
            </Link>
          ))}
          <Link
            href="/trips"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary bg-secondary px-3 py-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex items-center gap-1 text-[13px] font-bold text-primary">
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
