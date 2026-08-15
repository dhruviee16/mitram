"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTripSearch } from "@/hooks/use-trip-search";
import { Search, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

type HeroStats = {
  averageRating: number;
  travelers: number;
};

export function Hero({ stats }: { stats?: HeroStats }) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { matches, isLoading } = useTripSearch(destination);

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
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
    <section className="bg-secondary px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-foreground">
            Introductory offer — save up to ₹6,000
          </span>
          <h1 className="mt-4 font-heading text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl lg:text-6xl">
            A yatra with dignity, booked with confidence.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] text-muted-foreground sm:text-base">
            Verified companions, daily health checks and live location — so the
            person clicking &ldquo;Pay&rdquo; from another city feels as at ease
            as the one on the road.
          </p>

          {stats ? (
            <div className="mt-5 flex items-center gap-2 text-sm text-foreground">
              <span className="flex items-center gap-1 font-bold">
                <Star
                  className="size-4 fill-accent text-accent"
                  aria-hidden="true"
                />
                {stats.averageRating.toFixed(1)}/5
              </span>
              <span className="text-muted-foreground">
                · {stats.travelers}+ seniors travelled with Mitram
              </span>
            </div>
          ) : null}

          <div className="mt-7 rounded-2xl bg-card text-left shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)]">
            <div className="px-5 pt-4">
              <span className="inline-block rounded-t-lg bg-secondary px-4 py-2.5 font-heading text-[13px] font-bold text-primary">
                Domestic Yatra
              </span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-wrap gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:gap-4"
            >
              <Field className="min-w-36 flex-1 border-b border-border pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                <FieldLabel
                  htmlFor="hero-search-from"
                  className="text-[10px] font-bold text-muted-foreground uppercase"
                >
                  From
                </FieldLabel>
                <Input
                  id="hero-search-from"
                  type="text"
                  defaultValue="New Delhi"
                  className="h-auto border-0 bg-transparent p-0 text-sm text-foreground shadow-none focus-visible:ring-0"
                />
              </Field>
              <Field className="relative min-w-36 flex-1 border-b border-border pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:px-4">
                <FieldLabel
                  htmlFor="hero-search-to"
                  className="text-[10px] font-bold text-muted-foreground uppercase"
                >
                  Going to
                </FieldLabel>
                <Input
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
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 100)
                  }
                  className="h-auto border-0 bg-transparent p-0 text-sm text-foreground shadow-none focus-visible:ring-0"
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
              </Field>
              <Button
                type="submit"
                size="lg"
                className="shrink-0 gap-2 rounded-lg px-6 py-3 text-sm font-bold"
              >
                <Search className="size-4" aria-hidden="true" />
                Search
              </Button>
            </form>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-md lg:block">
          <div
            className="absolute -top-8 -right-6 -z-10 size-40 rounded-full bg-accent/30"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-8 -left-8 -z-10 size-32 rounded-full bg-primary/20"
            aria-hidden="true"
          />
          <div className="relative aspect-3/4 overflow-hidden rounded-[2rem]">
            <Image
              src="/images/hero/himalaya-path.jpg"
              alt="A traveller walking a Himalayan valley path toward the mountains"
              fill
              priority
              sizes="(min-width: 1024px) 28rem, 0px"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-1/2 flex w-[85%] -translate-x-1/2 items-center gap-2.5 rounded-xl bg-card px-4 py-3 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.25)]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-foreground">
                Police-verified Saathi
              </p>
              <p className="text-xs text-muted-foreground">
                On every Mitram journey
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
