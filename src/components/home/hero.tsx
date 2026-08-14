"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTripSearch } from "@/hooks/use-trip-search";

export function Hero() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { matches, isLoading } = useTripSearch(destination);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    const params = destination.trim()
      ? `?q=${encodeURIComponent(destination.trim())}`
      : "";
    router.push(`/trips${params}`);
  }

  function goToTrip(slug: string) {
    setShowSuggestions(false);
    router.push(`/trips/${slug}`);
  }

  return (
    <section className="relative bg-linear-to-br from-foreground via-primary to-foreground px-4 py-12 sm:px-6 sm:py-16">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/brand/senior-pilgrims.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-15 mix-blend-luminosity"
        />
      </div>
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold tracking-widest text-primary-foreground/75 uppercase">
          Senior-assisted travel, done right
        </p>
        <h1 className="mt-3 font-heading text-3xl leading-tight font-bold text-primary-foreground sm:text-5xl">
          A yatra with dignity, booked with confidence.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-primary-foreground/85 sm:text-base">
          Verified companions, daily health checks and live location — so the
          person clicking &ldquo;Pay&rdquo; from another city feels as at ease
          as the one on the road.
        </p>
        <span className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground">
          Introductory offer — save up to ₹6,000
        </span>

        <div className="mt-7 rounded-2xl bg-card text-left shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)]">
          <div className="px-5 pt-4">
            <span className="inline-block rounded-t-lg bg-secondary px-4 py-2.5 font-heading text-[13px] font-bold text-primary">
              Domestic Yatra
            </span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex-1 border-b border-border pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
              <label
                htmlFor="hero-search-from"
                className="block text-[10px] font-bold text-muted-foreground uppercase"
              >
                From
              </label>
              <input
                id="hero-search-from"
                type="text"
                defaultValue="New Delhi"
                className="mt-0.5 w-full bg-transparent text-sm text-foreground outline-none"
              />
            </div>
            <div className="relative flex-1 border-b border-border pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:px-4">
              <label
                htmlFor="hero-search-to"
                className="block text-[10px] font-bold text-muted-foreground uppercase"
              >
                Going to
              </label>
              <input
                id="hero-search-to"
                type="text"
                placeholder="e.g. Char Dham, Bhutan"
                autoComplete="off"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                className="mt-0.5 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />

              {showSuggestions && destination.trim().length > 0 && (
                <ul
                  role="listbox"
                  className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-md border border-border bg-card text-left shadow-lg"
                >
                  {isLoading ? (
                    <li className="px-3 py-2 text-sm text-muted-foreground">
                      Searching...
                    </li>
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
                          <span className="font-semibold text-foreground">
                            {trip.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {trip.routeSummary}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
            <div className="min-w-32.5 sm:pr-2">
              <label
                htmlFor="hero-search-travelers"
                className="block text-[10px] font-bold text-muted-foreground uppercase"
              >
                Travelers
              </label>
              <input
                id="hero-search-travelers"
                type="text"
                placeholder="2 adults"
                className="mt-0.5 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Search className="size-4" aria-hidden="true" />
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
