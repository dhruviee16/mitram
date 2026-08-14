import { searchTrips } from "@/server/services/tripService";
import { listCategories } from "@/server/services/categoryService";
import { TripCard } from "@/components/trip/trip-card";
import { DiscoveryTabs } from "@/components/trips/discovery-tabs";
import { CategoryChips } from "@/components/trips/category-chips";
import { TripFilterForm } from "@/components/trips/trip-filter-form";
import type { TripSort } from "@/server/services/tripService";
import type { TripsSearchParams } from "@/lib/trip-query";
import { toStringArray } from "@/lib/trip-query";

export const metadata = { title: "All Trips — MITRAM" };

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<TripsSearchParams>;
}) {
  const params = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);
  const num = (v: string | string[] | undefined) => {
    const s = str(v);
    return s ? Number(s) : undefined;
  };

  const [trips, categories] = await Promise.all([
    searchTrips({
      q: str(params.q),
      category: str(params.category),
      month: str(params.month),
      durationMax: num(params.durationMax),
      priceMin: num(params.priceMin),
      priceMax: num(params.priceMax),
      walkingIntensity: toStringArray(params.walking),
      mealsPlan: toStringArray(params.meals),
      insuranceIncluded: str(params.insurance) === "1",
      coordinatorIncluded: str(params.coordinator) === "1",
      sort: (str(params.sort) as TripSort) ?? "recommended",
    }),
    listCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">All Yatras</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {trips.length} senior-assisted trip{trips.length === 1 ? "" : "s"}, every one with a verified companion.
      </p>

      <div className="mt-5">
        <DiscoveryTabs searchParams={params} />
      </div>
      <div className="mt-4">
        <CategoryChips categories={categories} searchParams={params} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <TripFilterForm searchParams={params} />
        </aside>
        <div>
          {trips.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              No trips match your search. Try a different destination or category.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="list">
              {trips.map((trip) => (
                <li key={trip.slug}>
                  <TripCard trip={trip} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
