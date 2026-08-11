import { useQuery } from "@tanstack/react-query";

export type TripSearchResult = {
  slug: string;
  title: string;
  routeSummary: string;
};

async function fetchTrips(): Promise<TripSearchResult[]> {
  const res = await fetch("/api/trips");
  if (!res.ok) throw new Error("Could not load trips.");
  return res.json();
}

export function useTripSearch(query: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["trips", "search-index"],
    queryFn: fetchTrips,
    staleTime: 5 * 60 * 1000,
  });

  const trimmed = query.trim().toLowerCase();
  const matches =
    trimmed.length === 0
      ? []
      : (data ?? [])
          .filter(
            (trip) =>
              trip.title.toLowerCase().includes(trimmed) ||
              trip.routeSummary.toLowerCase().includes(trimmed)
          )
          .slice(0, 6);

  return { matches, isLoading };
}
