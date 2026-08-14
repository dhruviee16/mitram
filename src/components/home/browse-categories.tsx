import Link from "next/link";
import { Flame, Landmark, Mountain, Globe, PartyPopper, MapPin, Users, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  spiritual: Flame,
  heritage: Landmark,
  "nature-wildlife": Mountain,
  leisure: Globe,
  festival: PartyPopper,
  "state-focused": MapPin,
  community: Users,
};

type Category = {
  slug: string;
  name: string;
  _count: { trips: number };
};

export function BrowseCategories({ categories }: { categories: Category[] }) {
  return (
    <section className="px-4 pt-10 pb-2 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Find your kind of journey
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ slug, name, _count }) => {
            const Icon = ICONS[slug] ?? Globe;
            return (
              <Link
                key={slug}
                href={`/trips?category=${slug}`}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-5 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <span className="text-[13px] font-semibold text-foreground">{name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {_count.trips} trip{_count.trips === 1 ? "" : "s"}
                </span>
              </Link>
            );
          })}
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
