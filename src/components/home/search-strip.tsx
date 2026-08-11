"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTripSearch } from "@/hooks/use-trip-search";

export function SearchStrip() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { matches, isLoading } = useTripSearch(destination);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    const params = destination.trim() ? `?q=${encodeURIComponent(destination.trim())}` : "";
    router.push(`/trips${params}`);
  }

  function goToTrip(slug: string) {
    setShowSuggestions(false);
    router.push(`/trips/${slug}`);
  }

  return (
    <div className="bg-primary px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-heading text-lg font-bold text-primary-foreground sm:text-xl">
          Where does your parents&rsquo; next yatra begin?
        </h1>
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 rounded-lg bg-card p-3 shadow-lg sm:flex-row sm:items-center"
        >
          <div className="flex-1 border-b border-border pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
            <label htmlFor="search-from" className="block text-[10px] font-bold uppercase text-muted-foreground">
              From
            </label>
            <input
              id="search-from"
              type="text"
              defaultValue="New Delhi"
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>
          <div className="relative flex-1 border-b border-border pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:px-3">
            <label htmlFor="search-to" className="block text-[10px] font-bold uppercase text-muted-foreground">
              Going to
            </label>
            <input
              id="search-to"
              type="text"
              placeholder="e.g. Char Dham"
              autoComplete="off"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />

            {showSuggestions && destination.trim().length > 0 && (
              <ul
                role="listbox"
                className="absolute left-0 right-0 top-full z-10 mt-2 max-h-64 overflow-y-auto rounded-md border border-border bg-card text-left shadow-lg"
              >
                {isLoading ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">Searching...</li>
                ) : matches.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    No trips match &ldquo;{destination.trim()}&rdquo; yet.
                  </li>
                ) : (
                  matches.map((trip) => (
                    <li key={trip.slug}>
                      <button
                        type="button"
                        onMouseDown={() => goToTrip(trip.slug)}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        <span className="font-semibold text-foreground">{trip.title}</span>
                        <span className="block text-xs text-muted-foreground">{trip.routeSummary}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Search className="size-4" aria-hidden="true" />
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
