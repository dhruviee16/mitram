# Vendor Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let external tour operators sign up as vendors, create/edit their own trips, see bookings and simulated earnings on those trips, and post live-tracking updates for ongoing bookings — surfaced through properly linked, role-aware navigation.

**Architecture:** Reuses the existing `User`/Auth.js v5 credentials login by adding a `vendor` role; adds a nullable `Trip.vendorId`; new `vendorService.ts` (MVC service layer) backs a `/vendor/*` route tree of server components + thin API routes, following the exact patterns already used by `bookingService`/`tripService` and the dashboard feature.

**Tech Stack:** Next.js App Router, Prisma 7 (driver-adapter), Auth.js v5, react-hook-form + zod, TanStack Query (client mutations), shadcn/ui (base-nova/Base UI), Tailwind brand tokens.

## Global Constraints

- Package manager is **pnpm** — never `npm`/`npx`; use `pnpm dlx` for one-off CLI (shadcn, prisma).
- Services own all Prisma queries; route handlers stay thin (parse/validate/call/shape); server components/pages call services directly.
- Never hardcode hex/Tailwind palette colors — use semantic classes (`bg-primary`, `text-muted-foreground`, etc.); headings use `font-heading`, body `font-body`.
- Ownership violations return 404 (not 403) — matches `bookingService` convention, avoids leaking existence.
- `authService.verifyCredentials` timing-safe behavior must not be touched.
- No test framework exists in this repo — verification gate per task is `pnpm exec tsc --noEmit` + `pnpm lint`, plus a final end-to-end browser check (Chrome automation) in the last task. Do not introduce a test framework.
- No admin approval/KYC gate, no real payouts, no draft/published trip state — explicitly out of scope per the spec.
- Regenerate Prisma client after any schema change: `pnpm dlx prisma generate` (check it actually ran — not always auto-triggered).

---

### Task 1: Schema — vendor role + Trip.vendorId

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `UserRole` enum value `"vendor"`; `Trip.vendorId: string | null`; `Trip.vendor` relation; `User.vendorTrips: Trip[]` relation.

- [ ] **Step 1: Edit the enum and add the relation fields**

In `prisma/schema.prisma`, change:

```prisma
enum UserRole {
  traveler
  nri
}
```

to:

```prisma
enum UserRole {
  traveler
  nri
  vendor
}
```

Add `vendorId`/`vendor` to `Trip` (after `createdAt` line inside the model is fine, but keep grouped near other fields):

```prisma
model Trip {
  id             String    @id @default(cuid())
  slug           String    @unique
  title          String
  category       String
  routeSummary   String
  durationDays   Int
  durationNights Int
  basePrice      Int
  images         String[]  @default([])
  careFeatures   String[]  @default([])
  inclusions     String[]  @default([])
  summary        String
  days           TripDay[]
  bookings       Booking[]
  vendor         User?     @relation("VendorTrips", fields: [vendorId], references: [id])
  vendorId       String?
  createdAt      DateTime  @default(now())
}
```

Add `vendorTrips` to `User`:

```prisma
model User {
  id               String            @id @default(cuid())
  email            String            @unique
  passwordHash     String
  name             String
  phone            String?
  role             UserRole          @default(traveler)
  travelerProfiles TravelerProfile[]
  bookings         Booking[]
  vendorTrips      Trip[]            @relation("VendorTrips")
  createdAt        DateTime          @default(now())
}
```

- [ ] **Step 2: Run the migration**

Run: `pnpm dlx prisma migrate dev --name add-vendor-role-and-trip-vendor`
Expected: migration applies cleanly (nullable column, no data loss).

- [ ] **Step 3: Regenerate the Prisma client**

Run: `pnpm dlx prisma generate`
Expected: no errors; `src/generated/prisma` updated.

- [ ] **Step 4: Verify**

Run: `pnpm exec tsc --noEmit`
Expected: passes (nothing references the new fields yet, so this just confirms the schema/client are consistent).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): add vendor role and Trip.vendorId"
```

---

### Task 2: Category taxonomy — shared constant + filter chips + seed remap

**Files:**
- Create: `src/lib/trip-categories.ts`
- Modify: `src/components/trips/filter-chips.tsx`
- Modify: `prisma/seed-data/trips.ts`

**Interfaces:**
- Produces: `TRIP_CATEGORIES: readonly { value: string; label: string }[]` from `src/lib/trip-categories.ts`, exported as the single source of truth for category values/labels.

- [ ] **Step 1: Create the shared category list**

`src/lib/trip-categories.ts`:

```ts
export const TRIP_CATEGORIES = [
  { value: "community", label: "Community-Based Journeys" },
  { value: "state-focused", label: "State-Focused Explorations" },
  { value: "spiritual", label: "Spiritual Journeys" },
  { value: "leisure", label: "Leisure & Fun Getaways" },
  { value: "nature-wildlife", label: "Nature & Wildlife Escapes" },
  { value: "heritage", label: "Heritage & Cultural Trails" },
  { value: "festival", label: "Festival-Centric Trips" },
] as const;

export type TripCategoryValue = (typeof TRIP_CATEGORIES)[number]["value"];
```

- [ ] **Step 2: Wire it into the filter chips**

Read `src/components/trips/filter-chips.tsx` first to confirm current shape, then replace the hardcoded `categories` array with one built from the shared constant, keeping the `"all"` entry:

```tsx
"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TRIP_CATEGORIES } from "@/lib/trip-categories";

const categories = [{ value: "all", label: "All" }, ...TRIP_CATEGORIES];

export function FilterChips({
  active,
  onChange,
}: {
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <ToggleGroup
      aria-label="Filter trips by category"
      value={[active]}
      onValueChange={(value) => {
        if (value.length > 0) onChange(value[0]);
      }}
      className="flex-wrap"
    >
      {categories.map((c) => (
        <ToggleGroupItem key={c.value} value={c.value} className="rounded-full">
          {c.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
```

- [ ] **Step 3: Remap seed data categories**

In `prisma/seed-data/trips.ts`, replace every `category: "pilgrimage"` with `category: "spiritual"`, every `category: "international"` with `category: "leisure"`. Leave `category: "heritage"` unchanged (value matches new taxonomy already).

- [ ] **Step 4: Re-seed**

Run: `pnpm dlx prisma db seed`
Expected: completes without error; trips now carry the new category values.

- [ ] **Step 5: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/trip-categories.ts src/components/trips/filter-chips.tsx prisma/seed-data/trips.ts
git commit -m "feat: centralize trip category taxonomy, remap seed data"
```

---

### Task 3: Vendor signup — service, validation, API route, page

**Files:**
- Modify: `src/server/services/authService.ts`
- Create: `src/lib/validations/vendor.ts`
- Create: `src/app/api/vendor/register/route.ts`
- Create: `src/components/vendor/vendor-signup-form.tsx`
- Create: `src/app/vendor/signup/page.tsx`

**Interfaces:**
- Consumes: `authService.registerUser` (existing), `DuplicateEmailError` (existing), `signupSchema` shape from `src/lib/validations/auth.ts` (name/email/password — reused as-is for the vendor form, no new schema needed for signup itself).
- Produces: `registerUser(email, password, name, role?: "traveler" | "nri" | "vendor")` — 4th param optional, defaults `"traveler"`, so every existing call site (`src/app/api/auth/register/route.ts`) keeps working unchanged.

- [ ] **Step 1: Extend `registerUser` with an optional role param**

In `src/server/services/authService.ts`, change:

```ts
export async function registerUser(email: string, password: string, name: string) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new DuplicateEmailError();
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash, name, role: "traveler" },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
```

to:

```ts
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: "traveler" | "nri" | "vendor" = "traveler"
) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new DuplicateEmailError();
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash, name, role },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
```

- [ ] **Step 2: Create `src/lib/validations/vendor.ts`**

This file will grow in later tasks (trip + trip-update schemas); for now it just re-exports the signup schema under a vendor-specific name for clarity at call sites:

```ts
export { signupSchema as vendorSignupSchema, type SignupValues as VendorSignupValues } from "@/lib/validations/auth";
```

- [ ] **Step 3: Create the vendor register API route**

`src/app/api/vendor/register/route.ts` — deliberately separate from `/api/auth/register` so the client can never pass an arbitrary `role`; this route always registers as `"vendor"`:

```ts
import { NextResponse } from "next/server";
import { vendorSignupSchema } from "@/lib/validations/vendor";
import { registerUser, DuplicateEmailError } from "@/server/services/authService";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = vendorSignupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const user = await registerUser(
      parsed.data.email,
      parsed.data.password,
      parsed.data.name,
      "vendor"
    );
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("vendor registerUser failed:", err);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create the vendor signup form**

Read `src/components/auth/signup-form.tsx` first — this is a near-copy pointed at the vendor endpoint and vendor dashboard redirect, with vendor-specific copy:

`src/components/vendor/vendor-signup-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

import { vendorSignupSchema, type VendorSignupValues } from "@/lib/validations/vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function VendorSignupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<VendorSignupValues>({
    resolver: zodResolver(vendorSignupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: VendorSignupValues) {
    setSubmitting(true);

    const res = await fetch("/api/vendor/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Could not create account." }));
      toast.error(data.error ?? "Could not create account.");
      setSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setSubmitting(false);

    if (result?.error) {
      toast.warning("Account created — please sign in.");
      router.push("/login");
      return;
    }

    router.push("/vendor/dashboard");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business / operator name</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create vendor account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already a partner?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
```

- [ ] **Step 5: Create the vendor signup page**

Read `src/app/signup/page.tsx` first for the pattern. `src/app/vendor/signup/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VendorSignupForm } from "@/components/vendor/vendor-signup-form";
import { auth } from "@/auth";

export default async function VendorSignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect(
      (session.user as { role?: string }).role === "vendor" ? "/vendor/dashboard" : "/"
    );
  }

  return (
    <AuthLayout
      title="List your trips on Mitram"
      subtitle="Reach families booking safe, senior-friendly travel."
    >
      <VendorSignupForm />
    </AuthLayout>
  );
}
```

- [ ] **Step 6: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add src/server/services/authService.ts src/lib/validations/vendor.ts src/app/api/vendor/register/route.ts src/components/vendor/vendor-signup-form.tsx src/app/vendor/signup/page.tsx
git commit -m "feat: vendor signup flow"
```

---

### Task 4: Route protection for /vendor/dashboard, /vendor/trips, /vendor/bookings

**Files:**
- Modify: `src/proxy.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new (edge-level redirect only; role checks happen per-page in later tasks).

- [ ] **Step 1: Add vendor prefixes to the protected list**

In `src/proxy.ts`, change:

```ts
const protectedPrefixes = ["/dashboard", "/book"];
```

to:

```ts
const protectedPrefixes = ["/dashboard", "/book", "/vendor/dashboard", "/vendor/trips", "/vendor/bookings"];
```

and update the matcher:

```ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/book/:path*",
    "/vendor/dashboard/:path*",
    "/vendor/trips/:path*",
    "/vendor/bookings/:path*",
  ],
};
```

Note: `/vendor` (landing) and `/vendor/signup` are deliberately excluded — they must stay public.

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add src/proxy.ts
git commit -m "feat: protect vendor dashboard/trips/bookings routes"
```

---

### Task 5: vendorService.ts — trips, bookings, earnings, updates

**Files:**
- Create: `src/lib/validations/vendor.ts` (extend — modify, from Task 3)
- Create: `src/server/services/vendorService.ts`

**Interfaces:**
- Consumes: `prisma` from `src/server/db.ts`.
- Produces:
  - `listTripsForVendor(vendorId: string)`
  - `createTrip(vendorId: string, input: VendorTripValues)`
  - `getTripForVendor(tripId: string, vendorId: string)`
  - `updateTrip(tripId: string, vendorId: string, input: VendorTripValues)`
  - `listBookingsForVendorTrip(tripId: string, vendorId: string)`
  - `getVendorEarnings(vendorId: string): Promise<number>`
  - `postTripUpdate(bookingId: string, vendorId: string, input: VendorTripUpdateValues)`
  - `getBookingForVendorUpdate(bookingId: string, vendorId: string)` — booking + trip + existing tripUpdates, ownership-checked, for the update-posting page.
  - All ownership failures throw `new Error("Trip not found.")` or `new Error("Booking not found.")`.

- [ ] **Step 1: Extend `src/lib/validations/vendor.ts` with trip and update schemas**

Append to the file created in Task 3:

```ts
import { z } from "zod";
import { TRIP_CATEGORIES } from "@/lib/trip-categories";

const categoryValues = TRIP_CATEGORIES.map((c) => c.value) as [string, ...string[]];

function listFromLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export const vendorTripDaySchema = z.object({
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().min(1, "Enter a day title."),
  description: z.string().min(1, "Enter a day description."),
  activities: z.string().transform(listFromLines).default(""),
});

export const vendorTripSchema = z.object({
  title: z.string().min(1, "Enter a trip title."),
  category: z.enum(categoryValues),
  routeSummary: z.string().min(1, "Enter a route summary."),
  durationDays: z.coerce.number().int().min(1),
  durationNights: z.coerce.number().int().min(0),
  basePrice: z.coerce.number().int().min(1),
  images: z.string().transform(listFromLines).default(""),
  careFeatures: z.string().transform(listFromLines).default(""),
  inclusions: z.string().transform(listFromLines).default(""),
  summary: z.string().min(1, "Enter a trip summary."),
  days: z.array(vendorTripDaySchema).min(1, "Add at least one itinerary day."),
});

export type VendorTripValues = z.infer<typeof vendorTripSchema>;

export const vendorTripUpdateSchema = z.object({
  locationLabel: z.string().min(1, "Enter a location."),
  note: z.string().optional(),
  healthBp: z.string().optional(),
  healthSugar: z.string().optional(),
  healthTemp: z.string().optional(),
  healthStatus: z.enum(["ok", "monitor"]).optional(),
});

export type VendorTripUpdateValues = z.infer<typeof vendorTripUpdateSchema>;
```

(This makes the file's final export set: `vendorSignupSchema`, `VendorSignupValues`, `vendorTripDaySchema`, `vendorTripSchema`, `VendorTripValues`, `vendorTripUpdateSchema`, `VendorTripUpdateValues`.)

- [ ] **Step 2: Write `src/server/services/vendorService.ts`**

```ts
import { prisma } from "@/server/db";
import type { VendorTripValues, VendorTripUpdateValues } from "@/lib/validations/vendor";
import { nanoid } from "nanoid";

export function listTripsForVendor(vendorId: string) {
  return prisma.trip.findMany({
    where: { vendorId },
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });
}

function slugify(title: string) {
  return `${title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${nanoid(6)}`;
}

export async function createTrip(vendorId: string, input: VendorTripValues) {
  const trip = await prisma.trip.create({
    data: {
      slug: slugify(input.title),
      title: input.title,
      category: input.category,
      routeSummary: input.routeSummary,
      durationDays: input.durationDays,
      durationNights: input.durationNights,
      basePrice: input.basePrice,
      images: input.images,
      careFeatures: input.careFeatures,
      inclusions: input.inclusions,
      summary: input.summary,
      vendorId,
      days: {
        create: input.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          activities: day.activities,
        })),
      },
    },
  });

  return { tripId: trip.id, slug: trip.slug };
}

export async function getTripForVendor(tripId: string, vendorId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { days: { orderBy: { dayNumber: "asc" } } },
  });
  if (!trip || trip.vendorId !== vendorId) {
    throw new Error("Trip not found.");
  }
  return trip;
}

export async function updateTrip(tripId: string, vendorId: string, input: VendorTripValues) {
  const existing = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!existing || existing.vendorId !== vendorId) {
    throw new Error("Trip not found.");
  }

  await prisma.tripDay.deleteMany({ where: { tripId } });

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      title: input.title,
      category: input.category,
      routeSummary: input.routeSummary,
      durationDays: input.durationDays,
      durationNights: input.durationNights,
      basePrice: input.basePrice,
      images: input.images,
      careFeatures: input.careFeatures,
      inclusions: input.inclusions,
      summary: input.summary,
      days: {
        create: input.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          activities: day.activities,
        })),
      },
    },
  });

  return { tripId: trip.id, slug: trip.slug };
}

export async function listBookingsForVendorTrip(tripId: string, vendorId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.vendorId !== vendorId) {
    throw new Error("Trip not found.");
  }

  return prisma.booking.findMany({
    where: { tripId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVendorEarnings(vendorId: string) {
  const result = await prisma.payment.aggregate({
    where: { status: "paid", booking: { trip: { vendorId } } },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getBookingForVendorUpdate(bookingId: string, vendorId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      trip: true,
      user: true,
      tripUpdates: { orderBy: { timestamp: "desc" } },
    },
  });
  if (!booking || booking.trip.vendorId !== vendorId) {
    throw new Error("Booking not found.");
  }
  return booking;
}

export async function postTripUpdate(
  bookingId: string,
  vendorId: string,
  input: VendorTripUpdateValues
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true },
  });
  if (!booking || booking.trip.vendorId !== vendorId) {
    throw new Error("Booking not found.");
  }
  if (booking.status !== "ongoing") {
    throw new Error("Booking is not ongoing.");
  }

  return prisma.tripUpdate.create({
    data: {
      bookingId,
      timestamp: new Date(),
      locationLabel: input.locationLabel,
      note: input.note,
      healthBp: input.healthBp,
      healthSugar: input.healthSugar,
      healthTemp: input.healthTemp,
      healthStatus: input.healthStatus,
    },
  });
}
```

- [ ] **Step 3: Confirm `nanoid` is available**

Run: `grep '"nanoid"' package.json`
Expected: a match. If no match, run `pnpm add nanoid` first (small dependency, needed for unique trip slugs since vendor-entered titles can collide).

- [ ] **Step 4: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/vendor.ts src/server/services/vendorService.ts package.json pnpm-lock.yaml
git commit -m "feat: vendorService with ownership-checked trip/booking/earnings/update operations"
```

---

### Task 6: Vendor trip API routes

**Files:**
- Create: `src/app/api/vendor/trips/route.ts`
- Create: `src/app/api/vendor/trips/[id]/route.ts`
- Create: `src/app/api/vendor/bookings/[id]/updates/route.ts`

**Interfaces:**
- Consumes: `vendorTripSchema`, `vendorTripUpdateSchema` (Task 5), `createTrip`, `updateTrip`, `postTripUpdate` (Task 5), `auth` from `src/auth.ts`.
- Produces: `POST /api/vendor/trips`, `PUT /api/vendor/trips/[id]`, `POST /api/vendor/bookings/[id]/updates`.

- [ ] **Step 1: `src/app/api/vendor/trips/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { vendorTripSchema } from "@/lib/validations/vendor";
import { createTrip } from "@/server/services/vendorService";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    return NextResponse.json({ error: "Not signed in as a vendor." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = vendorTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const result = await createTrip(session.user.id, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("createTrip failed:", err);
    return NextResponse.json({ error: "Could not create trip." }, { status: 500 });
  }
}
```

- [ ] **Step 2: `src/app/api/vendor/trips/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { vendorTripSchema } from "@/lib/validations/vendor";
import { updateTrip } from "@/server/services/vendorService";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    return NextResponse.json({ error: "Not signed in as a vendor." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = vendorTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const result = await updateTrip(id, session.user.id, parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("updateTrip failed:", err);
    const message = err instanceof Error ? err.message : "Could not update trip.";
    return NextResponse.json(
      { error: message },
      { status: message === "Trip not found." ? 404 : 500 }
    );
  }
}
```

- [ ] **Step 3: `src/app/api/vendor/bookings/[id]/updates/route.ts`**

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { vendorTripUpdateSchema } from "@/lib/validations/vendor";
import { postTripUpdate } from "@/server/services/vendorService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    return NextResponse.json({ error: "Not signed in as a vendor." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = vendorTripUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const update = await postTripUpdate(id, session.user.id, parsed.data);
    return NextResponse.json(update, { status: 201 });
  } catch (err) {
    console.error("postTripUpdate failed:", err);
    const message = err instanceof Error ? err.message : "Could not post update.";
    const status = message === "Booking not found." ? 404 : message === "Booking is not ongoing." ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 4: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/vendor
git commit -m "feat: vendor trip and trip-update API routes"
```

---

### Task 7: Vendor trip form component (create + edit)

**Files:**
- Create: `src/components/vendor/trip-form.tsx`

**Interfaces:**
- Consumes: `vendorTripSchema`, `VendorTripValues` (Task 5), shadcn `Textarea`/`Select` (installed this task).
- Produces: `TripForm({ mode, tripId?, defaultValues? }: { mode: "create" | "edit"; tripId?: string; defaultValues?: Partial<VendorTripValues & { days: { dayNumber: number; title: string; description: string; activities: string }[] }> })` — a client component. Note the form's internal day `activities` field is a raw newline-string (matches the zod `.transform`), not yet split into an array — callers passing `defaultValues` for edit must join `activities.join("\n")` before passing in.

- [ ] **Step 1: Install Textarea and Select**

Run: `pnpm dlx shadcn@latest add textarea select`
Expected: adds `src/components/ui/textarea.tsx` and `src/components/ui/select.tsx`. If either doesn't install cleanly against the `base-nova` style (same class of issue noted in `CLAUDE.md` for `form`), hand-write it following the pattern of the existing `src/components/ui/form.tsx` / `switch.tsx` wrapping `@base-ui/react` primitives — check what installed before assuming it's broken.

- [ ] **Step 2: Write the form**

Read `src/components/dashboard/live-tracking-panel.tsx` and `src/components/auth/signup-form.tsx` first for the established client-component + react-hook-form conventions. Then write `src/components/vendor/trip-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { vendorTripSchema, type VendorTripValues } from "@/lib/validations/vendor";
import { TRIP_CATEGORIES } from "@/lib/trip-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type TripFormDefaultValues = {
  title: string;
  category: string;
  routeSummary: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  images: string;
  careFeatures: string;
  inclusions: string;
  summary: string;
  days: { dayNumber: number; title: string; description: string; activities: string }[];
};

const emptyDefaults: TripFormDefaultValues = {
  title: "",
  category: TRIP_CATEGORIES[0].value,
  routeSummary: "",
  durationDays: 1,
  durationNights: 0,
  basePrice: 0,
  images: "",
  careFeatures: "",
  inclusions: "",
  summary: "",
  days: [{ dayNumber: 1, title: "", description: "", activities: "" }],
};

export function TripForm({
  mode,
  tripId,
  defaultValues,
}: {
  mode: "create" | "edit";
  tripId?: string;
  defaultValues?: TripFormDefaultValues;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TripFormDefaultValues>({
    resolver: zodResolver(vendorTripSchema) as never,
    defaultValues: defaultValues ?? emptyDefaults,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "days" });

  async function onSubmit(values: TripFormDefaultValues) {
    setSubmitting(true);

    const url = mode === "create" ? "/api/vendor/trips" : `/api/vendor/trips/${tripId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Could not save trip." }));
      toast.error(data.error ?? "Could not save trip.");
      setSubmitting(false);
      return;
    }

    toast.success(mode === "create" ? "Trip created." : "Trip updated.");
    router.push("/vendor/dashboard");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as never)} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRIP_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="routeSummary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route summary</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Delhi → Haridwar → Rishikesh" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationNights"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nights</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base price (INR)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URLs (one per line)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="careFeatures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Care features (one per line)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} placeholder="Wheelchair-accessible coach" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inclusions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inclusions (one per line)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} placeholder="All meals" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">Itinerary</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ dayNumber: fields.length + 1, title: "", description: "", activities: "" })
              }
            >
              Add day
            </Button>
          </div>

          {fields.map((day, index) => (
            <div key={day.id} className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Day {index + 1}</p>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    Remove
                  </Button>
                )}
              </div>
              <FormField
                control={form.control}
                name={`days.${index}.dayNumber`}
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`days.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`days.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`days.${index}.activities`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activities (one per line)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : mode === "create" ? "Create trip" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
```

Note: `zodResolver(vendorTripSchema) as never` and `onSubmit as never` sidestep the input/output type mismatch created by zod `.transform()` on `images`/`careFeatures`/`inclusions`/`activities` (form input type is `string`, parsed output type is `string[]`) — react-hook-form's `useForm` generic must track the pre-transform shape (`TripFormDefaultValues`, all raw strings) since that's what the inputs bind to; the resolver's output type differs, which is exactly what `.transform()` is for. If `pnpm exec tsc --noEmit` complains on this pattern specifically, drop the `zodResolver` for this form and validate manually in `onSubmit` before the `fetch` call instead — don't fight the generic.

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both pass. If the resolver typing fails per the note above, apply the manual-validation fallback, re-run, confirm clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/textarea.tsx src/components/ui/select.tsx src/components/vendor/trip-form.tsx
git commit -m "feat: vendor trip create/edit form"
```

---

### Task 8: Vendor dashboard, trip create/edit pages, bookings list page

**Files:**
- Create: `src/app/vendor/dashboard/page.tsx`
- Create: `src/app/vendor/trips/new/page.tsx`
- Create: `src/app/vendor/trips/[id]/edit/page.tsx`
- Create: `src/app/vendor/trips/[id]/bookings/page.tsx`
- Create: `src/components/vendor/vendor-trip-card.tsx`

**Interfaces:**
- Consumes: `listTripsForVendor`, `getVendorEarnings`, `getTripForVendor`, `listBookingsForVendorTrip` (Task 5), `TripForm` (Task 7).

- [ ] **Step 1: `src/components/vendor/vendor-trip-card.tsx`**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

type VendorTripCardTrip = {
  id: string;
  title: string;
  category: string;
  basePrice: number;
  _count: { bookings: number };
};

export function VendorTripCard({ trip }: { trip: VendorTripCardTrip }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="font-heading text-base font-bold text-foreground">{trip.title}</p>
        <p className="mt-1 text-xs text-muted-foreground capitalize">{trip.category.replace("-", " ")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {trip._count.bookings} booking{trip._count.bookings === 1 ? "" : "s"} · ₹
          {trip.basePrice.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/vendor/trips/${trip.id}/bookings`}>Bookings</Link>} />
        <Button variant="secondary" size="sm" render={<Link href={`/vendor/trips/${trip.id}/edit`}>Edit</Link>} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `src/app/vendor/dashboard/page.tsx`**

```tsx
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listTripsForVendor, getVendorEarnings } from "@/server/services/vendorService";
import { VendorTripCard } from "@/components/vendor/vendor-trip-card";
import { Button } from "@/components/ui/button";

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/login");
  }

  const [trips, earnings] = await Promise.all([
    listTripsForVendor(session.user.id),
    getVendorEarnings(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Your trips</h1>
        <Button render={<Link href="/vendor/trips/new">Add trip</Link>} />
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Total earnings (paid bookings)</p>
        <p className="mt-1 font-heading text-2xl font-bold text-primary">
          ₹{earnings.toLocaleString("en-IN")}
        </p>
      </div>

      {trips.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          You haven&apos;t added a trip yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {trips.map((trip) => (
            <li key={trip.id}>
              <VendorTripCard trip={trip} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `src/app/vendor/trips/new/page.tsx`**

```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TripForm } from "@/components/vendor/trip-form";

export default async function NewVendorTripPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Add a trip</h1>
      <div className="mt-6">
        <TripForm mode="create" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `src/app/vendor/trips/[id]/edit/page.tsx`**

```tsx
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getTripForVendor } from "@/server/services/vendorService";
import { TripForm } from "@/components/vendor/trip-form";

export default async function EditVendorTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/login");
  }

  const { id } = await params;

  let trip;
  try {
    trip = await getTripForVendor(id, session.user.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Edit trip</h1>
      <div className="mt-6">
        <TripForm
          mode="edit"
          tripId={trip.id}
          defaultValues={{
            title: trip.title,
            category: trip.category,
            routeSummary: trip.routeSummary,
            durationDays: trip.durationDays,
            durationNights: trip.durationNights,
            basePrice: trip.basePrice,
            images: trip.images.join("\n"),
            careFeatures: trip.careFeatures.join("\n"),
            inclusions: trip.inclusions.join("\n"),
            summary: trip.summary,
            days: trip.days.map((d) => ({
              dayNumber: d.dayNumber,
              title: d.title,
              description: d.description,
              activities: d.activities.join("\n"),
            })),
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: `src/app/vendor/trips/[id]/bookings/page.tsx`**

```tsx
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { listBookingsForVendorTrip } from "@/server/services/vendorService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function VendorTripBookingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/login");
  }

  const { id } = await params;

  let bookings;
  try {
    bookings = await listBookingsForVendorTrip(id, session.user.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Bookings</h1>

      {bookings.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="font-semibold text-foreground">{booking.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.numTravelers} traveler{booking.numTravelers === 1 ? "" : "s"} · ₹
                  {booking.totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {booking.status}
                </Badge>
                {booking.status === "ongoing" && (
                  <Button
                    size="sm"
                    render={<Link href={`/vendor/bookings/${booking.id}/updates`}>Post update</Link>}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/vendor/dashboard src/app/vendor/trips src/components/vendor/vendor-trip-card.tsx
git commit -m "feat: vendor dashboard, trip create/edit, and bookings-per-trip pages"
```

---

### Task 9: Vendor trip-update posting page

**Files:**
- Create: `src/hooks/use-post-trip-update.ts`
- Create: `src/components/vendor/trip-update-form.tsx`
- Create: `src/app/vendor/bookings/[id]/updates/page.tsx`

**Interfaces:**
- Consumes: `vendorTripUpdateSchema`, `VendorTripUpdateValues` (Task 5), `getBookingForVendorUpdate` (Task 5).
- Produces: `usePostTripUpdate()` — TanStack Query mutation hook mirroring `src/hooks/use-set-tracking-visibility.ts`.

- [ ] **Step 1: `src/hooks/use-post-trip-update.ts`**

Read `src/hooks/use-set-tracking-visibility.ts` first — this mirrors it exactly:

```ts
import { useMutation } from "@tanstack/react-query";
import type { VendorTripUpdateValues } from "@/lib/validations/vendor";

type Input = { bookingId: string; values: VendorTripUpdateValues };

async function postUpdate({ bookingId, values }: Input) {
  const res = await fetch(`/api/vendor/bookings/${bookingId}/updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not post update.");
  }
  return res.json();
}

export function usePostTripUpdate() {
  return useMutation({ mutationFn: postUpdate });
}
```

- [ ] **Step 2: `src/components/vendor/trip-update-form.tsx`**

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { vendorTripUpdateSchema, type VendorTripUpdateValues } from "@/lib/validations/vendor";
import { usePostTripUpdate } from "@/hooks/use-post-trip-update";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function TripUpdateForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const postTripUpdate = usePostTripUpdate();

  const form = useForm<VendorTripUpdateValues>({
    resolver: zodResolver(vendorTripUpdateSchema),
    defaultValues: {
      locationLabel: "",
      note: "",
      healthBp: "",
      healthSugar: "",
      healthTemp: "",
    },
  });

  function onSubmit(values: VendorTripUpdateValues) {
    postTripUpdate.mutate(
      { bookingId, values },
      {
        onSuccess: () => {
          toast.success("Update posted.");
          form.reset();
          router.refresh();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="locationLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Rishikesh — Laxman Jhula" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (optional)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="healthBp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BP</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="120/80" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="healthSugar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sugar</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="110 mg/dL" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="healthTemp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temp</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="98.4°F" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={postTripUpdate.isPending}>
          {postTripUpdate.isPending ? "Posting..." : "Post update"}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 3: `src/app/vendor/bookings/[id]/updates/page.tsx`**

```tsx
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getBookingForVendorUpdate } from "@/server/services/vendorService";
import { TripUpdateForm } from "@/components/vendor/trip-update-form";

export default async function VendorBookingUpdatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "vendor") {
    redirect("/login");
  }

  const { id } = await params;

  let booking;
  try {
    booking = await getBookingForVendorUpdate(id, session.user.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        {booking.trip.title} — {booking.user.name}
      </h1>
      {booking.status !== "ongoing" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Updates can only be posted while this booking is ongoing.
        </p>
      ) : (
        <div className="mt-6">
          <TripUpdateForm bookingId={booking.id} />
        </div>
      )}

      {booking.tripUpdates.length > 0 && (
        <ol className="mt-8 space-y-3">
          {booking.tripUpdates.map((update) => (
            <li key={update.id} className="border-l-2 border-primary/30 pl-3 text-sm">
              <p className="font-semibold text-foreground">{update.locationLabel}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(update.timestamp).toLocaleString("en-IN")}
              </p>
              {update.note && <p className="mt-1 text-muted-foreground">{update.note}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-post-trip-update.ts src/components/vendor/trip-update-form.tsx src/app/vendor/bookings
git commit -m "feat: vendor trip-update posting page"
```

---

### Task 10: Discoverability — /vendor landing page, footer link, role-aware nav

**Files:**
- Create: `src/app/vendor/page.tsx`
- Modify: `src/components/layout/site-footer.tsx`
- Modify: `src/components/layout/site-nav.tsx`

**Interfaces:**
- Consumes: `auth()` (already used in `site-nav.tsx`).

This is the task that directly answers "make sure pages are properly linked" — vendors currently have zero discoverable entry point, and a logged-in vendor would otherwise see the traveler nav (Yatras/All Packages/My Bookings), none of which apply to them.

- [ ] **Step 1: `src/app/vendor/page.tsx`** — public landing page, no auth check

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VendorLandingPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        List your trips on Mitram
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Reach families booking safe, senior-friendly travel — manage your trips,
        bookings, and live updates in one place.
      </p>
      <div className="mt-6 flex gap-3">
        <Button render={<Link href="/vendor/signup">Become a partner</Link>} />
        <Button variant="outline" render={<Link href="/login">Vendor sign in</Link>} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the footer link**

Read `src/components/layout/site-footer.tsx` first (already read this session — it's a plain, no-links footer). Add a partner link:

```tsx
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-heading text-base font-semibold text-primary">Mitram</p>
        <p className="mt-2 max-w-md">
          Senior-assisted travel, done right. A trust layer that makes
          senior travel safe for the traveler and visible for the family paying for it.
        </p>
        <Link href="/vendor" className="mt-4 inline-block font-medium text-primary hover:underline">
          List your trips on Mitram — Become a partner
        </Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Make the main nav role-aware**

Read `src/components/layout/site-nav.tsx` in full first (it's already been edited once this session — confirm current state before touching). Replace the static `links` array + rendering with a role-branch: signed-in vendors see vendor links, everyone else sees the existing traveler links.

```tsx
import Link from "next/link";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/auth";

const travelerLinks = [
  { href: "/trips", label: "Yatras" },
  { href: "/trips", label: "All Packages" },
  { href: "/dashboard", label: "My Bookings" },
];

const vendorLinks = [
  { href: "/vendor/dashboard", label: "My Trips" },
];

export async function SiteNav() {
  const session = await auth();
  const isVendor = (session?.user as { role?: string } | undefined)?.role === "vendor";
  const links = isVendor ? vendorLinks : travelerLinks;

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={isVendor ? "/vendor/dashboard" : "/"} className="flex items-center gap-2">
          <Image
            src="/images/brand/logo.png"
            alt="Mitram"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-heading text-xl font-bold text-primary">Mitram</span>
        </Link>

        <NavigationMenu aria-label="Main" className="hidden md:flex">
          <NavigationMenuList>
            {links.map((link) => (
              <NavigationMenuItem key={link.label}>
                <NavigationMenuLink render={<Link href={link.href}>{link.label}</Link>} />
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Verify**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/vendor/page.tsx src/components/layout/site-footer.tsx src/components/layout/site-nav.tsx
git commit -m "feat: vendor landing page, footer link, role-aware main nav"
```

---

### Task 11: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Full static check**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: all three pass clean.

- [ ] **Step 2: Start the dev server**

Run: `pnpm dev` (background)

- [ ] **Step 3: Browser walkthrough (Chrome automation)**

1. Navigate to `/`, confirm footer shows "List your trips on Mitram — Become a partner" linking to `/vendor`.
2. Navigate to `/vendor`, click "Become a partner" → lands on `/vendor/signup`.
3. Sign up a vendor (e.g. `vendorcheck@example.com`). Confirm redirect to `/vendor/dashboard`, nav now shows only "My Trips" (no Yatras/All Packages/My Bookings), empty state visible.
4. Click "Add trip", fill the form (all fields, at least 2 itinerary days), submit. Confirm redirect back to `/vendor/dashboard` and the new trip appears in the list with a "0 bookings" count.
5. Navigate to `/trips` as a fresh/incognito session (or sign out), confirm the new trip appears there and is bookable, and that the category filter chips reflect the new taxonomy (7 categories + All).
6. As a traveler, book the vendor's new trip. Confirm the booking appears under `/vendor/trips/[id]/bookings` for the vendor.
7. Using `psql`, set that booking's `status` to `ongoing` (e.g. `UPDATE "Booking" SET status = 'ongoing' WHERE id = '<id>';`). As the vendor, navigate to `/vendor/trips/[id]/bookings`, confirm a "Post update" button now appears, click through to `/vendor/bookings/[id]/updates`, submit a location update.
8. As the traveler, navigate to `/dashboard/bookings/[id]`, confirm the `LiveTrackingPanel` shows the vendor-posted update.
9. Confirm `/dashboard` booking card for that booking shows the "Live tracking available" badge (added earlier this session).

- [ ] **Step 4: Clean up test data**

```bash
psql "postgresql://postgres:postgres@localhost:5432/mitram" -c "DELETE FROM \"User\" WHERE email IN ('vendorcheck@example.com');"
```
(Cascades will need the trip/booking deleted first if FK constraints block the user delete — check the error and delete `Trip`/`Booking` rows by the test vendor's id first if needed.)

- [ ] **Step 5: Stop the dev server**

Kill the background `pnpm dev` process.

- [ ] **Step 6: Report**

No commit for this task (verification only) — confirm to the user that the full flow works end-to-end, and note anything found that needed a follow-up fix during the walkthrough (fix and commit separately, referencing which task's code it touched).

---

## Self-Review Notes

- **Spec coverage:** data model (Task 1), category taxonomy (Task 2), vendor signup/auth (Task 3, 4), vendorService (Task 5), trip CRUD API (Task 6), trip form (Task 7), dashboard/trip/bookings pages (Task 8), trip-update posting (Task 9), discoverability/nav (Task 10, directly addresses the user's "properly linked" note), full walkthrough (Task 11). All spec sections covered.
- **Ownership convention:** every vendor-scoped service function checks `vendorId` ownership and throws a generic not-found error, consistently mapped to 404 in routes and `notFound()` in pages — matches `bookingService` precedent throughout.
- **Type consistency checked:** `registerUser`'s 4th param name/type (`role: "traveler" | "nri" | "vendor" = "traveler"`) matches every call site added (`vendor/register/route.ts`) and the untouched one (`auth/register/route.ts`, which just omits the param). `VendorTripValues`/`VendorTripUpdateValues` names match between `vendor.ts` validations and every service/route/component that imports them. `TripForm`'s `defaultValues` shape matches exactly what Task 8's edit page constructs from `getTripForVendor`'s Prisma result (`.join("\n")` on array fields).
