import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toStringArray, type TripsSearchParams } from "@/lib/trip-query";

const WALKING_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "challenging", label: "Challenging" },
];

const MEALS_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "departure-soon", label: "Departure Soon" },
];

function str(v: string | string[] | undefined) {
  return typeof v === "string" ? v : "";
}

export function TripFilterForm({ searchParams }: { searchParams: TripsSearchParams }) {
  const walking = toStringArray(searchParams.walking);
  const meals = toStringArray(searchParams.meals);

  return (
    <form action="/trips" method="get" className="space-y-6 rounded-lg border border-border bg-card p-4">
      {searchParams.category && typeof searchParams.category === "string" && (
        <input type="hidden" name="category" value={searchParams.category} />
      )}

      <div>
        <label htmlFor="q" className="text-sm font-semibold text-foreground">
          Where do you want to go?
        </label>
        <div className="relative mt-1.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={str(searchParams.q)}
            placeholder="Destination, trip name..."
            className="h-11 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="month" className="text-sm font-semibold text-foreground">
            Travel month
          </label>
          <select
            id="month"
            name="month"
            defaultValue={str(searchParams.month)}
            className="mt-1.5 h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Any month</option>
            {["2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11","2026-12"].map((m) => (
              <option key={m} value={m}>
                {new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="text-sm font-semibold text-foreground">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={str(searchParams.sort) || "recommended"}
            className="mt-1.5 h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-foreground">Budget (per person)</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-3">
          <input
            name="priceMin"
            type="number"
            min={0}
            defaultValue={str(searchParams.priceMin)}
            placeholder="Min ₹"
            aria-label="Minimum price"
            className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <input
            name="priceMax"
            type="number"
            min={0}
            defaultValue={str(searchParams.priceMax)}
            placeholder="Max ₹"
            aria-label="Maximum price"
            className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </fieldset>

      <div>
        <label htmlFor="durationMax" className="text-sm font-semibold text-foreground">
          Duration (max days)
        </label>
        <select
          id="durationMax"
          name="durationMax"
          defaultValue={str(searchParams.durationMax)}
          className="mt-1.5 h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Any</option>
          <option value="4">Up to 4 days</option>
          <option value="7">Up to 7 days</option>
          <option value="10">Up to 10 days</option>
          <option value="15">Up to 15 days</option>
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-foreground">Walking intensity</legend>
        <div className="mt-2 flex flex-col gap-2">
          {WALKING_OPTIONS.map((o) => (
            <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                name="walking"
                value={o.value}
                defaultChecked={walking.includes(o.value)}
                className="size-[18px] shrink-0 rounded border-input"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-foreground">Meals</legend>
        <div className="mt-2 flex flex-col gap-2">
          {MEALS_OPTIONS.map((o) => (
            <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                name="meals"
                value={o.value}
                defaultChecked={meals.includes(o.value)}
                className="size-[18px] shrink-0 rounded border-input"
              />
              {o.label} included
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Other</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            name="insurance"
            value="1"
            defaultChecked={str(searchParams.insurance) === "1"}
            className="size-[18px] shrink-0 rounded border-input"
          />
          Insurance included
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            name="coordinator"
            value="1"
            defaultChecked={str(searchParams.coordinator) === "1"}
            className="size-[18px] shrink-0 rounded border-input"
          />
          MITRAM coordinator included
        </label>
      </fieldset>

      <Button type="submit" className="w-full min-h-11">
        Apply filters
      </Button>
    </form>
  );
}
