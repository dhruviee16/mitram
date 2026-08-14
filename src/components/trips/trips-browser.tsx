"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterChips } from "@/components/trips/filter-chips";
import { TripCard } from "@/components/trip/trip-card";

type Trip = Parameters<typeof TripCard>[0]["trip"] & { category: string };

export function TripsBrowser({ trips }: { trips: Trip[] }) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");

  const filtered = useMemo(() => {
    return trips.filter((trip) => {
      const matchesCategory = category === "all" || trip.category === category;
      const matchesQuery =
        !initialQuery ||
        trip.title.toLowerCase().includes(initialQuery.toLowerCase()) ||
        trip.routeSummary.toLowerCase().includes(initialQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [trips, category, initialQuery]);

  return (
    <div>
      <FilterChips active={category} onChange={setCategory} />
      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No trips match your search. Try a different destination or category.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {filtered.map((trip) => (
            <li key={trip.slug}>
              <TripCard trip={trip} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
