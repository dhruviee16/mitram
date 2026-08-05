# MITRAM Public Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Home (`/`), trip listing (`/trips`), and trip detail (`/trips/[slug]`) — real, working pages against the seeded trip catalog, matching the approved visual design and WCAG 2.1 AA baseline.

**Architecture:** Server components fetch via `tripService` directly (no API round-trip needed for these read-only, mostly-static pages, per the booking-site spec's "Views" layer). Client components only where interaction requires it: search input, filter chips, mobile nav toggle.

**Tech Stack:** Next.js App Router (server components + selective client components), shadcn/ui (Base UI-based), lucide-react icons, Tailwind v4 with the existing brand CSS variables.

This plan corresponds to spec: `docs/superpowers/specs/2026-08-05-public-pages-design.md`.

## Global Constraints

- Gold `#F5A623` never used as text/icon color on cream/white — fill/background only, dark text on top (see spec §3 contrast table).
- No emoji-as-icon — lucide-react only.
- Every interactive element keyboard-operable with a visible focus ring.
- Every image has real, descriptive `alt` text (or `alt=""` if decorative).
- Any hover/motion effect respects `prefers-reduced-motion`.
- Real seeded data throughout (8 trips from `prisma/seed-data/trips.ts`) — no new placeholder trip content. Testimonials are the one explicitly-sanctioned placeholder (pre-launch, no real customers), marked as such in code.

---

### Task 1: Shared layout — skip link, nav, footer

**Files:**
- Create: `src/components/layout/skip-link.tsx`
- Create: `src/components/layout/site-nav.tsx`
- Create: `src/components/layout/site-footer.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `<SkipLink />`, `<SiteNav />`, `<SiteFooter />` — mounted once in the root layout, present on every page including future auth/booking/dashboard pages.

- [ ] **Step 1: Skip-to-content link**

`src/components/layout/skip-link.tsx`:

```tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Skip to content
    </a>
  );
}
```

- [ ] **Step 2: Site nav**

`src/components/layout/site-nav.tsx`:

```tsx
import Link from "next/link";

const links = [
  { href: "/trips", label: "Yatras" },
  { href: "/trips", label: "All Packages" },
  { href: "/dashboard", label: "Live Tracker" },
];

export function SiteNav() {
  return (
    <header className="border-b border-border bg-card">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
      >
        <Link href="/" className="font-heading text-xl font-bold text-primary">
          Mitram
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary focus-visible:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Sign In
        </Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Site footer**

`src/components/layout/site-footer.tsx`:

```tsx
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-heading text-base font-semibold text-primary">Mitram</p>
        <p className="mt-2 max-w-md">
          Senior-assisted travel, built with MakeMyTrip. A trust layer that makes
          senior travel safe for the traveler and visible for the family paying for it.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Wire into root layout**

In `src/app/layout.tsx`, import the three components and restructure the body:

```tsx
import { SkipLink } from "@/components/layout/skip-link";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
```

Replace the `<body>` contents with:

```tsx
<body className="min-h-full flex flex-col font-body">
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryProvider>
      <SkipLink />
      <SiteNav />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <Toaster />
    </QueryProvider>
  </ThemeProvider>
</body>
```

- [ ] **Step 5: Verify**

```bash
pnpm dev
```

Visit `http://localhost:3000`, confirm nav + footer render around the default scaffold content, tab from the page start and confirm the skip link appears on first Tab press. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add shared skip link, nav, and footer layout"
```

---

### Task 2: Shared TripCard component

**Files:**
- Create: `src/components/trip/trip-card.tsx`
- Test: manual verification (no test framework configured yet in this project — visual + a11y check per step 3)

**Interfaces:**
- Consumes: `Trip` type from `@/generated/prisma/client` (or the plain object shape returned by `tripService.listTrips()` — id, slug, title, category, routeSummary, durationDays, durationNights, basePrice, images, careFeatures).
- Produces: `<TripCard trip={trip} />` — used by Task 4 (home carousel) and Task 5 (`/trips` grid).

- [ ] **Step 1: Write the component**

Bordered card per the approved mockup (thin border, not shadow; photo top; trust-icon row; text-link CTA). Hover treatment borrowed from the 21st.dev `card-21` reference (subtle icon-translate on the CTA, not a scale/glow transform, to keep it calm and `prefers-reduced-motion`-safe by default since Tailwind's `transition` utilities already no-op under that media query via `motion-safe:`/`motion-reduce:` variants):

`src/components/trip/trip-card.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Radio, ArrowRight } from "lucide-react";

type TripCardTrip = {
  slug: string;
  title: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  images: string[];
  careFeatures: string[];
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=70";

export function TripCard({ trip }: { trip: TripCardTrip }) {
  const image = trip.images[0] ?? FALLBACK_IMAGE;
  const [firstFeature, secondFeature] = trip.careFeatures;

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative h-40 w-full">
        <Image
          src={image}
          alt={`${trip.title} — ${trip.routeSummary}`}
          fill
          sizes="(min-width: 768px) 320px, 90vw"
          className="object-cover"
        />
        <span className="absolute right-2 top-2 rounded bg-accent px-2 py-1 text-[11px] font-bold text-accent-foreground">
          {trip.durationDays}D/{trip.durationNights}N
        </span>
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-foreground">{trip.title}</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{trip.routeSummary}</p>

        {(firstFeature || secondFeature) && (
          <div className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-xs text-foreground">
            {firstFeature && (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                {firstFeature}
              </span>
            )}
            {secondFeature && (
              <span className="flex items-center gap-1.5">
                <Radio className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                {secondFeature}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="font-heading text-lg font-bold text-foreground">
            ₹{trip.basePrice.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-muted-foreground"> /person</span>
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary">
            View trip
            <ArrowRight
              className="size-3.5 transition-transform motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Allow the Unsplash image host in Next config**

Modify `next.config.ts` to add the `images.remotePatterns` entry (required by `next/image` for any external host):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify with a temporary render**

Temporarily render `<TripCard trip={...} />` with real seeded-shaped data on the home page (`src/app/page.tsx`), run `pnpm dev`, confirm in browser: image loads, gold duration badge is readable, trust-icon rows show real care-feature text, hover shows border color change + arrow shift, keyboard Tab reaches the card with a visible focus ring. Revert the temporary render (Task 3 replaces `page.tsx` properly).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add shared TripCard component"
```

---

### Task 3: Home page — search strip + hero

**Files:**
- Create: `src/components/home/search-strip.tsx`
- Create: `src/components/home/hero.tsx`

**Interfaces:**
- Produces: `<SearchStrip />` (client component, navigates to `/trips?q=...` on submit), `<Hero />` (server-renderable, static content).

- [ ] **Step 1: Search strip**

Client component — controlled "going to" text field, submits by pushing to `/trips` with a `q` query param that Task 5's listing page reads and filters by. Kept intentionally simple (text match against trip title/route, no live autocomplete dropdown) per the spec's YAGNI note.

`src/components/home/search-strip.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

export function SearchStrip() {
  const router = useRouter();
  const [destination, setDestination] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = destination.trim() ? `?q=${encodeURIComponent(destination.trim())}` : "";
    router.push(`/trips${params}`);
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
          <div className="flex-1 border-b border-border pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:px-3">
            <label htmlFor="search-to" className="block text-[10px] font-bold uppercase text-muted-foreground">
              Going to
            </label>
            <input
              id="search-to"
              type="text"
              placeholder="e.g. Char Dham"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
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
```

- [ ] **Step 2: Hero tagline panel**

`src/components/home/hero.tsx`:

```tsx
export function Hero() {
  return (
    <div className="bg-gradient-to-br from-[#5c1010] to-primary px-4 py-10 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/75">
        Senior-assisted travel, built with MakeMyTrip
      </p>
      <h2 className="mt-3 font-heading text-2xl font-bold text-primary-foreground sm:text-3xl">
        A yatra with dignity, done safely.
      </h2>
      <span className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground">
        Introductory offer — save up to ₹6,000
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

No standalone page yet to view these on — verified together with the rest of the home page in Task 4's step. Typecheck only for now:

```bash
pnpm exec tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add home page search strip and hero sections"
```

---

### Task 4: Home page — carousel, trust pillars, testimonials, CTA, assemble

**Files:**
- Create: `src/components/home/trip-carousel.tsx`
- Create: `src/components/home/trust-pillars.tsx`
- Create: `src/components/home/testimonials.tsx`
- Create: `src/components/home/home-cta.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `tripService.listTrips()` (Task 4 of the setup plan), `TripCard` (this plan's Task 2), `SearchStrip`/`Hero` (Task 3).

- [ ] **Step 1: Trip carousel**

`src/components/home/trip-carousel.tsx`:

```tsx
import { TripCard } from "@/components/trip/trip-card";

type Trip = Parameters<typeof TripCard>[0]["trip"];

export function TripCarousel({ trips }: { trips: Trip[] }) {
  return (
    <section aria-labelledby="carousel-heading" className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 id="carousel-heading" className="font-heading text-xl font-bold text-foreground">
          Mitram&rsquo;s Most-Loved Yatras
        </h2>
        <ul className="mt-4 flex gap-4 overflow-x-auto pb-2" role="list">
          {trips.map((trip) => (
            <li key={trip.slug} className="w-64 shrink-0">
              <TripCard trip={trip} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Trust pillar row**

`src/components/home/trust-pillars.tsx`:

```tsx
import { HeartPulse, Radio, ShieldCheck, Users } from "lucide-react";

const pillars = [
  { icon: HeartPulse, label: "Medical support" },
  { icon: Radio, label: "Live family tracking" },
  { icon: ShieldCheck, label: "Police-verified Saathi" },
  { icon: Users, label: "Senior-first pacing" },
];

export function TrustPillars() {
  return (
    <section aria-label="Why families trust Mitram" className="border-y border-border bg-secondary px-4 py-8 sm:px-6">
      <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8" role="list">
        {pillars.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon className="size-6 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Testimonials (explicitly placeholder — pre-launch, no real customers yet)**

`src/components/home/testimonials.tsx`:

```tsx
// Placeholder testimonials — Mitram is pre-launch with no real customers yet.
// Replace with real quotes once available; this is the one section the design
// spec explicitly sanctions placeholder content for.
const testimonials = [
  {
    quote:
      "I could see exactly where Papa was on the Shikharji trek, every step. That mattered more than anything else.",
    name: "Arjun J.",
    role: "Son, booked from Dubai",
  },
  {
    quote:
      "The companion knew Ma's medication schedule better than I did some days. That's what peace of mind looks like.",
    name: "Priya S.",
    role: "Daughter, Bangalore",
  },
  {
    quote: "First trip in years where I didn't feel like a burden on anyone.",
    name: "Ramesh J.",
    role: "Traveler, 72",
  },
];

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 id="testimonials-heading" className="font-heading text-xl font-bold text-foreground">
          What families say
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3" role="list">
          {testimonials.map((t) => (
            <li key={t.name} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm italic text-foreground">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Closing CTA**

`src/components/home/home-cta.tsx`:

```tsx
import Link from "next/link";

export function HomeCta() {
  return (
    <section className="px-4 py-10 text-center sm:px-6">
      <h2 className="font-heading text-xl font-bold text-foreground">
        Ready to plan their next yatra?
      </h2>
      <Link
        href="/trips"
        className="mt-4 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Explore trips
      </Link>
    </section>
  );
}
```

- [ ] **Step 5: Assemble the home page**

Replace `src/app/page.tsx` entirely:

```tsx
import { SearchStrip } from "@/components/home/search-strip";
import { Hero } from "@/components/home/hero";
import { TripCarousel } from "@/components/home/trip-carousel";
import { TrustPillars } from "@/components/home/trust-pillars";
import { Testimonials } from "@/components/home/testimonials";
import { HomeCta } from "@/components/home/home-cta";
import { listTrips } from "@/server/services/tripService";

export default async function Home() {
  const trips = await listTrips();

  return (
    <>
      <SearchStrip />
      <Hero />
      <TripCarousel trips={trips} />
      <TrustPillars />
      <Testimonials />
      <HomeCta />
    </>
  );
}
```

- [ ] **Step 6: Verify against real seeded data**

```bash
pnpm dev
```

Visit `http://localhost:3000`. Confirm: search strip renders and submitting "Char Dham" navigates to `/trips?q=Char%20Dham` (will 404-render gracefully until Task 5 exists — that's expected at this point), all 8 seeded trips scroll in the carousel with real images/prices, trust pillars show 4 lucide icons (no emoji), testimonials render 3 cards, CTA links to `/trips`. Tab through the whole page and confirm every interactive element gets a visible focus ring.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: assemble home page with carousel, trust pillars, testimonials"
```

---

### Task 5: Trip listing page (`/trips`)

**Files:**
- Create: `src/components/trips/filter-chips.tsx`
- Create: `src/components/trips/trips-browser.tsx`
- Create: `src/app/trips/page.tsx`

**Interfaces:**
- Consumes: `listTrips()`, `TripCard`.
- Produces: `/trips` route, reads `?q=` search param set by `SearchStrip`.

- [ ] **Step 1: Filter chips (presentational, controlled by parent)**

`src/components/trips/filter-chips.tsx`:

```tsx
"use client";

const categories = [
  { value: "all", label: "All" },
  { value: "pilgrimage", label: "Pilgrimage" },
  { value: "heritage", label: "Heritage" },
  { value: "international", label: "International" },
];

export function FilterChips({
  active,
  onChange,
}: {
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label="Filter trips by category" className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const isActive = active === c.value;
        return (
          <button
            key={c.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(c.value)}
            className={
              isActive
                ? "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                : "rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            }
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Client browser component (holds filter state, reads initial `q`)**

`src/components/trips/trips-browser.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterChips } from "@/components/trips/filter-chips";
import { TripCard } from "@/components/trip/trip-card";

type Trip = Parameters<typeof TripCard>[0]["trip"] & { category: string };

export function TripsBrowser({ trips }: { trips: Trip[] }) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [category, setCategory] = useState("all");

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
```

- [ ] **Step 3: Page (server component, wraps client browser in Suspense per Next.js's `useSearchParams` requirement)**

`src/app/trips/page.tsx`:

```tsx
import { Suspense } from "react";
import { TripsBrowser } from "@/components/trips/trips-browser";
import { listTrips } from "@/server/services/tripService";

export default async function TripsPage() {
  const trips = await listTrips();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">All Yatras</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {trips.length} senior-assisted trips, every one with a verified companion.
      </p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <TripsBrowser trips={trips} />
        </Suspense>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
pnpm dev
```

Visit `http://localhost:3000/trips` — confirm all 8 trips render in a grid. Click each category chip, confirm the grid filters and `aria-pressed` toggles (inspect via browser devtools or keyboard+screen reader). Visit `http://localhost:3000/trips?q=Char%20Dham`, confirm only the Char Dham trip shows. Tab through chips with keyboard only, confirm focus rings and Enter/Space activate them.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add trip listing page with category filter chips"
```

---

### Task 6: Trip detail page — photo header + itinerary

**Files:**
- Create: `src/components/trip-detail/photo-header.tsx`
- Create: `src/components/trip-detail/itinerary-section.tsx`
- Create: `src/app/trips/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getTripBySlug(slug)` from `tripService`.
- Produces: `/trips/[slug]` route (booking box added in Task 7).

- [ ] **Step 1: Photo header**

`src/components/trip-detail/photo-header.tsx`:

```tsx
import Image from "next/image";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&q=70";

export function PhotoHeader({
  title,
  routeSummary,
  durationDays,
  durationNights,
  image,
}: {
  title: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
  image?: string;
}) {
  return (
    <div className="relative h-56 w-full overflow-hidden sm:h-72">
      <Image
        src={image ?? FALLBACK_IMAGE}
        alt={`${title} — ${routeSummary}`}
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-white/85">
          {routeSummary} · {durationDays}D/{durationNights}N
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Itinerary section (handles trips with no seeded day data)**

`src/components/trip-detail/itinerary-section.tsx`:

```tsx
type TripDay = {
  dayNumber: number;
  title: string;
  description: string;
  activities: string[];
};

export function ItinerarySection({
  days,
  summary,
  inclusions,
}: {
  days: TripDay[];
  summary: string;
  inclusions: string[];
}) {
  if (days.length === 0) {
    return (
      <section aria-labelledby="itinerary-heading">
        <h2 id="itinerary-heading" className="font-heading text-xl font-bold text-foreground">
          About this trip
        </h2>
        <p className="mt-3 text-sm text-foreground">{summary}</p>
        {inclusions.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-foreground">What&rsquo;s included</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground" role="list">
              {inclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    );
  }

  return (
    <section aria-labelledby="itinerary-heading">
      <h2 id="itinerary-heading" className="font-heading text-xl font-bold text-foreground">
        Day-by-day itinerary
      </h2>
      <ol className="mt-4 space-y-6">
        {days.map((day) => (
          <li key={day.dayNumber} className="border-l-2 border-primary/30 pl-4">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Day {day.dayNumber} — {day.title}
            </p>
            <p className="mt-1 text-sm text-foreground">{day.description}</p>
            {day.activities.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground" role="list">
                {day.activities.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 3: Page (without booking box for now — added in Task 7)**

`src/app/trips/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { PhotoHeader } from "@/components/trip-detail/photo-header";
import { ItinerarySection } from "@/components/trip-detail/itinerary-section";
import { getTripBySlug } from "@/server/services/tripService";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  return (
    <div>
      <PhotoHeader
        title={trip.title}
        routeSummary={trip.routeSummary}
        durationDays={trip.durationDays}
        durationNights={trip.durationNights}
        image={trip.images[0]}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <ItinerarySection days={trip.days} summary={trip.summary} inclusions={trip.inclusions} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
pnpm dev
```

Visit `http://localhost:3000/trips/sammed-shikharji-yatra` — confirm 4 real days render with activities. Visit `http://localhost:3000/trips/char-dham-yatra` (a trip seeded with `days: []`) — confirm it falls back to the summary/inclusions view instead of an empty itinerary heading. Visit `http://localhost:3000/trips/does-not-exist` — confirm Next.js's not-found page renders (404).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add trip detail page with day-by-day itinerary"
```

---

### Task 7: Trip detail page — booking box (sticky sidebar / mobile bottom bar)

**Files:**
- Create: `src/components/trip-detail/booking-box.tsx`
- Modify: `src/app/trips/[slug]/page.tsx`

**Interfaces:**
- Produces: `<BookingBox trip={...} />`, links to `/book/[slug]` (booking wizard doesn't exist yet — this is expected to 404 until that spec/plan ships; noted inline).

- [ ] **Step 1: Booking box component**

Renders twice via CSS visibility (desktop sidebar vs mobile bottom bar) rather than JS resize detection — simpler, no layout-shift risk, matches the approved mockup exactly.

`src/components/trip-detail/booking-box.tsx`:

```tsx
import Link from "next/link";

export function BookingBox({
  slug,
  basePrice,
  inclusions,
}: {
  slug: string;
  basePrice: number;
  inclusions: string[];
}) {
  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden md:sticky md:top-6 md:block md:h-fit md:w-64 md:shrink-0 md:rounded-lg md:border md:border-border md:bg-card md:p-4">
        <BookingBoxContent slug={slug} basePrice={basePrice} inclusions={inclusions} />
      </aside>

      {/* Mobile: bar pinned to viewport bottom */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="font-heading text-lg font-bold text-foreground">
            ₹{basePrice.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-muted-foreground"> /person</span>
          </span>
          <Link
            href={`/book/${slug}`}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Book Now
          </Link>
        </div>
      </div>
    </>
  );
}

function BookingBoxContent({
  slug,
  basePrice,
  inclusions,
}: {
  slug: string;
  basePrice: number;
  inclusions: string[];
}) {
  return (
    <>
      <span className="font-heading text-2xl font-bold text-foreground">
        ₹{basePrice.toLocaleString("en-IN")}
      </span>
      <span className="block text-xs text-muted-foreground">/person</span>
      {inclusions.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-xs text-foreground" role="list">
          {inclusions.slice(0, 4).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      <Link
        href={`/book/${slug}`}
        className="mt-4 block rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Book Now
      </Link>
    </>
  );
}
```

- [ ] **Step 2: Wire into the trip detail page, add bottom padding on mobile so the pinned bar never covers content**

Modify `src/app/trips/[slug]/page.tsx` — replace the body div:

```tsx
import { notFound } from "next/navigation";
import { PhotoHeader } from "@/components/trip-detail/photo-header";
import { ItinerarySection } from "@/components/trip-detail/itinerary-section";
import { BookingBox } from "@/components/trip-detail/booking-box";
import { getTripBySlug } from "@/server/services/tripService";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  return (
    <div>
      <PhotoHeader
        title={trip.title}
        routeSummary={trip.routeSummary}
        durationDays={trip.durationDays}
        durationNights={trip.durationNights}
        image={trip.images[0]}
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 pb-24 sm:px-6 md:flex-row md:pb-8">
        <div className="flex-1">
          <ItinerarySection days={trip.days} summary={trip.summary} inclusions={trip.inclusions} />
        </div>
        <BookingBox slug={trip.slug} basePrice={trip.basePrice} inclusions={trip.inclusions} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
```

Visit `http://localhost:3000/trips/sammed-shikharji-yatra` at a desktop width — confirm the booking box sits as a sticky sidebar to the right of the itinerary and stays visible while scrolling. Resize/use devtools mobile emulation (<768px) — confirm the sidebar disappears and a bar pinned to the bottom of the viewport appears instead, and that page content isn't hidden behind it (check the last itinerary day is fully visible when scrolled to the bottom).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add sticky/mobile booking box to trip detail page"
```

---

### Task 8: Cross-page accessibility and verification pass

**Files:** No new files — verification and any small fixes found across Tasks 1-7's files.

- [ ] **Step 1: Keyboard-only pass**

With mouse untouched, Tab through Home, `/trips`, and a trip detail page end to end. Confirm: skip link is the first stop and jumps to `#main-content`; every link/button/chip is reachable in a logical order; every focused element has a visible ring (none rely on browser default alone being invisible against custom backgrounds); Enter/Space activate filter chips.

- [ ] **Step 2: Contrast spot-check**

Re-verify in the actual rendered pages (not just the CSS variables) that gold badges (duration badge, offer pill) always have dark `#1A1A1A`/`accent-foreground` text, never light text — confirm no component from Tasks 1-7 accidentally puts light/white text on the accent color.

- [ ] **Step 3: Alt text audit**

Grep for every `<Image` / `<img` usage added in this plan and confirm each has non-empty, descriptive `alt` (trip cards, photo header) — none should be `alt=""` since none are decorative in this plan.

```bash
grep -rn "alt=" src/components/trip src/components/trip-detail src/components/home
```

- [ ] **Step 4: Landmark check**

Confirm exactly one `<h1>` renders per page (Home's search strip heading, `/trips`' page heading, trip detail's photo-header heading) and that `<nav>`/`<main>`/`<footer>` landmarks from Task 1 wrap correctly with no duplicate `<main>`.

- [ ] **Step 5: Typecheck and lint the whole plan's work**

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Fix anything either reports before proceeding.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: accessibility verification pass on public pages"
```

## Definition of done for this plan

- `/`, `/trips`, `/trips/[slug]` all render real seeded data, no placeholder trip content.
- Search strip → `/trips?q=` → filtered results works end to end.
- Category chips filter the `/trips` grid.
- Trip detail shows real day-by-day itinerary where seeded, falls back gracefully where not.
- Booking box is sticky on desktop, pinned-bottom on mobile, links to `/book/[slug]` (expected to 404 until the booking-wizard plan ships).
- Keyboard navigation, focus rings, alt text, and the gold-contrast rule all verified in Task 8.
- Not yet built (separate specs/plans): auth pages, booking wizard, dashboard + live tracking.
