import Link from "next/link";
import { buildTripsHref, type TripsSearchParams } from "@/lib/trip-query";

type Category = { slug: string; name: string };

export function CategoryChips({
  categories,
  searchParams,
}: {
  categories: Category[];
  searchParams: TripsSearchParams;
}) {
  const active = typeof searchParams.category === "string" ? searchParams.category : undefined;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter trips by category">
      <Link
        href={buildTripsHref(searchParams, { category: undefined })}
        aria-pressed={!active}
        className={
          !active
            ? "rounded-full bg-secondary px-3.5 py-1.5 text-sm font-semibold text-secondary-foreground ring-1 ring-primary"
            : "rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground hover:border-primary"
        }
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={buildTripsHref(searchParams, { category: c.slug })}
          aria-pressed={active === c.slug}
          className={
            active === c.slug
              ? "rounded-full bg-secondary px-3.5 py-1.5 text-sm font-semibold text-secondary-foreground ring-1 ring-primary"
              : "rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground hover:border-primary"
          }
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
