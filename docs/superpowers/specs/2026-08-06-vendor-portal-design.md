# Vendor Portal — Design Spec

## Context

Mitram is a dual-buyer travel platform (seniors + adult children) built on curated,
seed-only trip data so far. This spec adds a self-serve vendor portal so external
tour operators can create and manage their own trips, see bookings on them, view
simulated earnings, and post live-tracking updates for ongoing bookings — the
mechanism the traveler-side dashboard already reads from (`LiveTrackingPanel`,
`TripUpdate` model, see `docs/superpowers/specs/2026-08-06-dashboard-design.md`).

Reference: `Deep Research On Mitram - Term 1.pdf` (investor research doc) confirms
"verified vendor" framing as core to Mitram's trust story, but is GTM/marketing
strategy, not a functional spec — no admin-approval/KYC gate is built here (see
Decisions below).

This also folds in a small pre-existing gap: `Trip.category` is currently a
free-text string with only 3 ad-hoc values actually wired into the UI
(`pilgrimage`, `heritage`, `international`; a 4th seed value `hill` exists but
isn't in the filter chips — a latent bug). This spec replaces that with a fixed,
shared taxonomy used by both the public trip filter and the new vendor trip form.

## Decisions (locked in during brainstorming)

- **Vendor scope**: full portal — trip CRUD, read-only bookings-on-my-trips list,
  simulated earnings view, and vendor-posted `TripUpdate` entries.
- **Signup**: self-serve, auto-approved. No admin gate, no KYC flow. Matches the
  project's concept-MVP framing (see root `CLAUDE.md`).
- **Auth**: reuse the existing `User` model and `/login` flow. Add `vendor` to
  `UserRole`. No separate vendor session/table.
- **Trip ownership**: `Trip.vendorId` is nullable. Existing seed trips stay
  `vendorId = null` ("Mitram-curated") and continue to show on `/trips` exactly
  as today, alongside vendor-created trips.
- **Payouts**: simulated only — a computed "Earnings" figure (sum of `paid`
  payments across the vendor's trips' bookings). No payout initiation, no
  Razorpay payout API, no bank details collected.
- **Trip updates**: vendors post real `TripUpdate` rows for ongoing bookings on
  their trips, through a form. This is the first non-seed source of
  `TripUpdate` data; existing seed-only rows are untouched.

## Data model changes

`prisma/schema.prisma`:

```prisma
enum UserRole {
  traveler
  nri
  vendor
}

model Trip {
  // ...existing fields...
  vendor   User?   @relation("VendorTrips", fields: [vendorId], references: [id])
  vendorId String?
}

model User {
  // ...existing fields...
  vendorTrips Trip[] @relation("VendorTrips")
}
```

`category` stays `String` (no enum) — value list moves to a new shared constant,
not the schema, so it can change without a migration.

Migration: `pnpm dlx prisma migrate dev --name add-vendor-role-and-trip-vendor`.
Regenerate client after (`pnpm dlx prisma generate`).

## Category taxonomy

New file `src/lib/trip-categories.ts`:

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
```

Consumed by:
- `src/components/trips/filter-chips.tsx` — replaces the hardcoded 3-item array.
- New vendor trip form (`category` select).

Existing seed data remapped (`prisma/seed.ts`) — old value → new value:
`pilgrimage` → `spiritual`, `heritage` → `heritage`, `hill` → `nature-wildlife`,
`international` → `leisure`. Re-run `pnpm dlx prisma db seed` after schema
migration to apply. `community`, `state-focused`, `festival` start with no seed
trips; vendors can create the first ones.

## Auth & access control

- `authService.registerUser(email, password, name, role = "traveler")` — add
  optional 4th param, default preserves existing traveler signup call sites.
- New `/vendor/signup` page (mirrors `/signup`, distinct copy: "List your trips
  on Mitram"), calls `registerUser(..., "vendor")`.
- Login stays shared at `/login` for all roles.
- Every `/vendor/*` server component/route checks `session.user.role ===
  "vendor"`; redirect to `/login` if unauthenticated, `/` if authenticated but
  wrong role (mirrors ownership-check convention already used in
  `dashboard/bookings/[id]/page.tsx`, using `notFound()`/`redirect()`, not a
  visible "forbidden" page).

## Routes & pages

- `/vendor` — public landing page: short pitch + "Become a Partner" CTA linking
  to `/vendor/signup`. Linked from `src/components/layout/site-footer.tsx` (not
  main nav — keeps traveler-facing nav uncluttered, per earlier design note).
- `/vendor/signup` — vendor signup form.
- `/vendor/dashboard` — vendor's trip list (card per trip: title, category,
  bookings count, status) + earnings summary card + "Add Trip" CTA. Empty state
  when no trips yet.
- `/vendor/trips/new` — trip creation form.
- `/vendor/trips/[id]/edit` — trip edit form, ownership-checked.
- `/vendor/trips/[id]/bookings` — read-only bookings list for that trip
  (traveler name, `bookedFor`, numTravelers, status, amount, createdAt).
- `/vendor/bookings/[id]/updates` — form to post a `TripUpdate` for a specific
  booking (must belong to one of the vendor's trips, booking status must be
  `ongoing`); shows existing updates for that booking below the form.

## Trip form fields

Title, category (select from `TRIP_CATEGORIES`), routeSummary, durationDays,
durationNights, basePrice (INR), images (newline/comma-separated URL list),
careFeatures (list), inclusions (list), summary, and itinerary days (repeatable
day entries: dayNumber, title, description, activities list) — mirrors
`TripDay` shape, matches fields already rendered on `/trips/[slug]`.

## Services

New `src/server/services/vendorService.ts`:

- `listTripsForVendor(vendorId)`
- `createTrip(vendorId, input)` — creates `Trip` + nested `TripDay[]` in one
  transaction.
- `updateTrip(tripId, vendorId, input)` — throws `"Trip not found."` if
  `trip.vendorId !== vendorId` (ownership check, mirrors `bookingService`
  convention: generic not-found error, not a 403, avoids leaking existence).
- `listBookingsForVendorTrip(tripId, vendorId)` — same ownership check.
- `getVendorEarnings(vendorId)` — sums `Payment.amount` where `status = "paid"`
  across bookings on the vendor's trips.
- `postTripUpdate(bookingId, vendorId, input)` — validates the booking's trip
  belongs to the vendor and `booking.status === "ongoing"`, then creates a
  `TripUpdate` row. Reuses the `TripUpdate` shape already consumed by
  `LiveTrackingPanel`.

Route handlers under `src/app/api/vendor/**/route.ts` stay thin (parse, call
service, shape response), per the project's MVC convention.

## Error handling

- Ownership violations (editing/viewing another vendor's trip or booking) →
  404, consistent with existing `bookingService` pattern.
- Zod validation on all vendor form submissions (new schemas in
  `src/lib/validations/vendor.ts`).
- Posting a `TripUpdate` for a non-ongoing booking → 400 with a clear message.

## Out of scope (explicitly, per Decisions)

- Admin approval / KYC verification flow.
- Real payouts or bank-account collection.
- Vendor-side trip publish/unpublish toggle (trips are live as soon as created
  — acceptable for concept-MVP; a future spec can add draft/published state if
  needed).
