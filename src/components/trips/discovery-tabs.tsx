import Link from "next/link";
import { buildTripsHref, type TripsSearchParams } from "@/lib/trip-query";

const TABS = [
  { label: "All", sort: undefined },
  { label: "New", sort: "newest" },
  { label: "Trending", sort: "popular" },
  { label: "Peak Season", sort: "departure-soon" },
] as const;

export function DiscoveryTabs({ searchParams }: { searchParams: TripsSearchParams }) {
  const activeSort = typeof searchParams.sort === "string" ? searchParams.sort : undefined;

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Trip discovery">
      {TABS.map((tab) => {
        const isActive = activeSort === tab.sort || (!activeSort && !tab.sort);
        return (
          <Link
            key={tab.label}
            href={buildTripsHref(searchParams, { sort: tab.sort })}
            role="tab"
            aria-selected={isActive}
            className={
              isActive
                ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                : "rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-primary"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
