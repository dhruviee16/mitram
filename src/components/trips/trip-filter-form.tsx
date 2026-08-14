"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const MONTH_OPTIONS = [
  "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
  "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12",
];

const DURATION_OPTIONS = [
  { value: "4", label: "Up to 4 days" },
  { value: "7", label: "Up to 7 days" },
  { value: "10", label: "Up to 10 days" },
  { value: "15", label: "Up to 15 days" },
];

const emptyFilters = {
  q: "",
  month: "",
  sort: "recommended",
  priceMin: "",
  priceMax: "",
  durationMax: "",
  walking: [] as string[],
  meals: [] as string[],
  insurance: false,
  coordinator: false,
};

function str(v: string | string[] | undefined) {
  return typeof v === "string" ? v : "";
}

export function TripFilterForm({ searchParams }: { searchParams: TripsSearchParams }) {
  const router = useRouter();
  const [q, setQ] = useState(str(searchParams.q));
  const [month, setMonth] = useState(str(searchParams.month));
  const [sort, setSort] = useState(str(searchParams.sort) || "recommended");
  const [priceMin, setPriceMin] = useState(str(searchParams.priceMin));
  const [priceMax, setPriceMax] = useState(str(searchParams.priceMax));
  const [durationMax, setDurationMax] = useState(str(searchParams.durationMax));
  const [walking, setWalking] = useState<string[]>(toStringArray(searchParams.walking));
  const [meals, setMeals] = useState<string[]>(toStringArray(searchParams.meals));
  const [insurance, setInsurance] = useState(str(searchParams.insurance) === "1");
  const [coordinator, setCoordinator] = useState(str(searchParams.coordinator) === "1");

  const hasActiveFilters =
    q || month || sort !== "recommended" || priceMin || priceMax || durationMax ||
    walking.length > 0 || meals.length > 0 || insurance || coordinator;

  function toggle(list: string[], value: string, setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function buildParams() {
    const params = new URLSearchParams();
    if (typeof searchParams.category === "string") params.set("category", searchParams.category);
    if (q) params.set("q", q);
    if (month) params.set("month", month);
    if (sort && sort !== "recommended") params.set("sort", sort);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (durationMax) params.set("durationMax", durationMax);
    walking.forEach((w) => params.append("walking", w));
    meals.forEach((m) => params.append("meals", m));
    if (insurance) params.set("insurance", "1");
    if (coordinator) params.set("coordinator", "1");
    return params;
  }

  function applyFilters() {
    const qs = buildParams().toString();
    router.push(qs ? `/trips?${qs}` : "/trips");
  }

  function clearFilters() {
    setQ(emptyFilters.q);
    setMonth(emptyFilters.month);
    setSort(emptyFilters.sort);
    setPriceMin(emptyFilters.priceMin);
    setPriceMax(emptyFilters.priceMax);
    setDurationMax(emptyFilters.durationMax);
    setWalking(emptyFilters.walking);
    setMeals(emptyFilters.meals);
    setInsurance(emptyFilters.insurance);
    setCoordinator(emptyFilters.coordinator);

    const params = new URLSearchParams();
    if (typeof searchParams.category === "string") params.set("category", searchParams.category);
    const qs = params.toString();
    router.push(qs ? `/trips?${qs}` : "/trips");
  }

  return (
    <Card>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="q">Where do you want to go?</FieldLabel>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Destination, trip name..."
                className="h-11 pl-9"
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="month">Travel month</FieldLabel>
              <Select value={month || "any"} onValueChange={(v) => setMonth(!v || v === "any" ? "" : v)}>
                <SelectTrigger id="month" className="h-11 w-full">
                  <SelectValue placeholder="Any month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any month</SelectItem>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="sort">Sort by</FieldLabel>
              <Select value={sort} onValueChange={(v) => v && setSort(v)}>
                <SelectTrigger id="sort" className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <FieldSet>
            <FieldLegend variant="label">Budget (per person)</FieldLegend>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="Min ₹"
                aria-label="Minimum price"
                className="h-11"
              />
              <Input
                type="number"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="Max ₹"
                aria-label="Maximum price"
                className="h-11"
              />
            </div>
          </FieldSet>

          <Field>
            <FieldLabel htmlFor="durationMax">Duration (max days)</FieldLabel>
            <Select value={durationMax || "any"} onValueChange={(v) => setDurationMax(!v || v === "any" ? "" : v)}>
              <SelectTrigger id="durationMax" className="h-11 w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {DURATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <FieldSet>
            <FieldLegend variant="label">Walking intensity</FieldLegend>
            <FieldGroup className="gap-2">
              {WALKING_OPTIONS.map((o) => (
                <FieldLabel key={o.value} htmlFor={`walking-${o.value}`} className="font-normal">
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`walking-${o.value}`}
                      checked={walking.includes(o.value)}
                      onCheckedChange={() => toggle(walking, o.value, setWalking)}
                    />
                    <FieldContent>{o.label}</FieldContent>
                  </Field>
                </FieldLabel>
              ))}
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend variant="label">Meals</FieldLegend>
            <FieldGroup className="gap-2">
              {MEALS_OPTIONS.map((o) => (
                <FieldLabel key={o.value} htmlFor={`meals-${o.value}`} className="font-normal">
                  <Field orientation="horizontal">
                    <Checkbox
                      id={`meals-${o.value}`}
                      checked={meals.includes(o.value)}
                      onCheckedChange={() => toggle(meals, o.value, setMeals)}
                    />
                    <FieldContent>{o.label} included</FieldContent>
                  </Field>
                </FieldLabel>
              ))}
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend variant="label" className="sr-only">Other</FieldLegend>
            <FieldGroup className="gap-2">
              <FieldLabel htmlFor="insurance-filter" className="font-normal">
                <Field orientation="horizontal">
                  <Checkbox id="insurance-filter" checked={insurance} onCheckedChange={(c) => setInsurance(c === true)} />
                  <FieldTitle className="font-normal">Insurance included</FieldTitle>
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="coordinator-filter" className="font-normal">
                <Field orientation="horizontal">
                  <Checkbox id="coordinator-filter" checked={coordinator} onCheckedChange={(c) => setCoordinator(c === true)} />
                  <FieldTitle className="font-normal">MITRAM coordinator included</FieldTitle>
                </Field>
              </FieldLabel>
            </FieldGroup>
          </FieldSet>

          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button type="button" variant="outline" className="flex-1 min-h-11" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
            <Button type="button" className="flex-1 min-h-11" onClick={applyFilters}>
              Apply filters
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
