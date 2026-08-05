# MITRAM Booking Website — Design Spec

Date: 2026-08-05
Status: Approved by user, pending spec review sign-off

## 1. Purpose

Build a real, working trip-booking website for MITRAM — a senior-assisted travel brand (pilgrimage/leisure trips for 60+ travelers, built around a "dual buyer" model where an adult child or NRI books and pays on behalf of a senior parent). This is an investor/concept MVP: functionality must be genuinely end-to-end (accounts, trip catalog, booking, payment), but does not need production hosting, real money movement, or the companion (Saathi) app / admin panel — those are out of scope for this build.

Source material: `Mitram_PRD.pdf`, market research findings, and four existing HTML mockups in `/Users/harsh/Downloads/MITRAM` that establish the brand's visual language and the dual-buyer booking concept.

## 2. Scope

**In scope:**
- Public marketing/browsing pages (home, trip listing, trip detail)
- Auth (signup/login, email + password)
- Dual-buyer booking flow (who is this for → traveler profile → room/care needs → review → pay)
- Razorpay payment integration (test mode)
- Traveler dashboard (my bookings, booking detail, a read-only family/NRI trip-progress view)

**Out of scope (explicitly deferred):**
- Saathi companion operational app
- Admin/back-office panel
- Real payment settlement / production hosting
- Phone/OTP auth (noted as a real-world roadmap item)

## 3. Architecture

**Stack:** Next.js (App Router) + TypeScript, shadcn/ui, TanStack Query, Prisma ORM, PostgreSQL (local, already installed on the user's machine — no Docker), NextAuth (Credentials provider) for auth, Razorpay Checkout (test mode) for payments.

**MVC-style layering inside the Next.js project:**

- **Models** — `prisma/schema.prisma` is the source of truth for data shape. `src/server/models/*` holds typed domain objects and mappers where Prisma's generated types aren't enough on their own.
- **Controllers** — `src/app/api/**/route.ts`. Route handlers only: parse and validate the request (zod), call a service, shape the HTTP response. No business logic here.
- **Services** — `src/server/services/*` (`tripService`, `bookingService`, `authService`, `paymentService`). All Prisma queries and domain rules live here, independently testable, and reused by both route handlers and server components.
- **Views** — `src/app/**/page.tsx` (server components for data-heavy, mostly-static pages: home, trip listing, trip detail) + `src/components/**` (shadcn-based UI). TanStack Query is used client-side specifically for interactive, stateful flows — the booking wizard and dashboard — where we want optimistic updates and refetching without full page reloads.

**Database:** Local PostgreSQL, default credentials (`postgres`/`postgres`, `localhost:5432`), database name `mitram`. Setup: `npx prisma migrate dev && npx prisma db seed`. Connection string lives in `.env` (`DATABASE_URL`), not committed.

**Official-docs rule:** every integration (NextAuth/Auth.js, Prisma, Razorpay, shadcn/ui, TanStack Query) is wired following each project's official documentation. If an official doc can't be located or is ambiguous for a specific step, that will be flagged to the user before proceeding rather than guessed from third-party tutorials.

## 4. Data model

- **User** — id, email, passwordHash, name, phone, role (`traveler` | `nri`)
- **TravelerProfile** — belongs to a User; represents the *senior* being traveled for: name, age, relationship to booker (self/parent/other), health notes (BP/diabetes/mobility tags), dietary needs (Jain satvik, diabetic, etc.)
- **Trip** — id, slug, title, category (pilgrimage/international/heritage/hill), route summary, duration (days/nights), basePrice, images, careFeatures[] (medical support, wheelchair, live tracking, satvik meals...), inclusions[]
- **TripDay** — tripId, dayNumber, title, description, activities[] — day-by-day itinerary content
- **Booking** — id, userId, tripId, bookedFor (`self` | `parent` | `nri`), travelers[] (linked TravelerProfiles), numTravelers, roomType, specialCareRequests[], totalAmount, status (pending/confirmed/upcoming/ongoing/completed/cancelled), trackingVisible (boolean, default true — see §6a)
- **Payment** — bookingId, razorpayOrderId, razorpayPaymentId, status, amount
- **TripUpdate** — bookingId, timestamp, locationLabel, lat, lng, note (e.g. "Reached Tonk 4 — Ajitnath Temple"), photoUrl (optional), healthCheckIn (bp, sugar, temperature, status: ok/monitor) — simulated/seeded data representing what a Saathi companion would log in the field; this app only *reads and displays* it, since the companion app itself is out of scope

## 5. Trip catalog (seed data)

Real content sourced from the provided materials, not placeholder text:

- From the existing mockups (short-form: pricing, dates, feature tags): Sammed Shikharji Yatra, Char Dham, Vaishno Devi, Kashmir Vistadome, Bhutan, Ladakh, Brazil & Peru, Spain & Portugal, Russia.
- Full day-by-day itineraries (richer detail, used to showcase the trip detail page): **South Temple Circuit** (Chennai → Madurai → Rameshwaram → Tiruchendur → Kanyakumari → Trivandrum, 7D/6N) and **Dwarka + Rann of Kutch** (7D/6N, ₹48,000–75,000).
- Additional variety from `/Iternies`: Delhi-Agra-Bharatpur, Jain Gujarat/Rajasthan circuit.

## 6. Pages

1. **`/`** — Home: hero, trust pillars (medical-first, live tracking, dignity-paced, satvik meals), featured trips, testimonials, CTA. Follows a trust-led "Hero → Problem/Solution → Testimonials → CTA" pattern, with the primary CTA present both in the hero and after testimonials.
2. **`/trips`** — Listing with filters (category, region, duration).
3. **`/trips/[slug]`** — Detail page: hero, day-by-day itinerary, inclusions, care features, pricing, "Book Now".
4. **`/login`, `/signup`** — email/password, via NextAuth Credentials provider.
5. **`/book/[tripSlug]`** — Multi-step booking wizard with a visible step indicator ("Step 2 of 4"): *Who is this for?* (myself / my parent / NRI booking from abroad) → traveler profile (reuse existing or create new) → room type + special care needs → review & price → Razorpay checkout (test mode).
6. **`/dashboard`** — "My Bookings" list, plus a toggle for a **family/NRI view** on an active booking (read-only trip-progress/health-check-in feed shaped like the Saathi dashboard mockup's data — the Saathi app itself is out of scope, but its data shape is worth mirroring here since it's core to the product's story).
7. **`/dashboard/bookings/[id]`** — Booking detail: payment status, itinerary recap, and — for bookings in `ongoing` status — a **Live Tracking** panel (see §6a).

### 6a. Live tracking (USP feature)

Called out explicitly in the PRD as a core differentiator ("Live GPS tracking and WhatsApp updates at every stop, with photos" — the second-strongest driver of booking intent after safety/medical trust) and this is what makes the family/NRI dashboard real rather than decorative. In scope for this build:

- A **map + timeline view** on `/dashboard/bookings/[id]` for any booking with `status = ongoing`: current/last-known location pin, a chronological feed of `TripUpdate` entries (location, note, optional photo, health check-in snapshot), mirroring the data the existing Saathi dashboard mockup shows (GPS check-in card, twice-daily vitals, "push update to family").
- Data is **simulated, not live device GPS** — this is a booking website, not the companion app. Seed data walks a demo booking through a trip day-by-day (e.g. the Shikharji or Dwarka+Rann itinerary) so the map/timeline has a real, coherent story to show investors, not a single static pin.
- **Visibility default, made explicit** (the PRD names this as an unresolved tension and asks that it be settled, not left open): tracking defaults to **visible to the booking's payer** (`trackingVisible = true`) — the buyer persona (adult child/NRI) is the one the feature exists for, and the research ranks their peace of mind above the senior's default-privacy preference for this specific signal. A toggle exists on the booking detail page to turn it off, so the dignity concern isn't ignored, just resolved as opt-out rather than opt-in. This default and the reasoning should be visible in the UI copy (e.g. a small note near the toggle), not just in code, since it's a real product decision, not a technical afterthought.

## 7. Visual design

shadcn/ui components, themed via CSS variables — **not** shadcn's neutral defaults. Palette and typography follow the brand already established by the logo and existing mockups:

- Primary (maroon): `#8B1A1A`
- Accent (gold): `#F5A623`
- Background (cream): `#FFFDF5`
- Headings: Playfair Display · Body: DM Sans

Theming conventions (per shadcn's official docs): colors defined as CSS variables in `globals.css` under `:root` and `.dark`, using shadcn's semantic naming (`--primary` / `--primary-foreground`, etc.), consumed in components as `bg-primary text-primary-foreground` rather than hardcoded Tailwind colors — so dark mode and any future re-theming stay centralized. Dark mode is supported from the start per shadcn convention, even though the primary demo path is light mode.

**Booking flow UX specifics** (from UX research):
- Multi-step wizard with a persistent step indicator, not a single long form.
- Forms built with shadcn `Form` + React Hook Form (`FormField` + `Controller`), not manual `useState` per field.
- Inline validation on blur, not just on submit.
- Correct input types/`autocomplete` attributes (email, tel, etc.), required-field indicators, visible loading → success/error feedback after submit.
- `Dialog` used for confirmations (e.g., booking confirmation), not repurposed alerts.
- No emoji-as-icon; use a consistent icon set (Lucide, which ships with shadcn). Accessible contrast, keyboard focus states, `prefers-reduced-motion` respected.

## 8. Payments

Razorpay Checkout in **test mode**: server creates a Razorpay Order via the official Orders API, client opens Razorpay Checkout with that order ID, and the payment signature is verified server-side after completion — following Razorpay's official Next.js/Node integration pattern. Test API keys and Razorpay's published test card numbers are used; no live money moves.

## 9. Explicitly out of scope / deferred

- Saathi companion app, admin panel (per user decision on platform scope)
- Phone/OTP login (email/password chosen for MVP speed; noted as a real-world follow-up)
- Production hosting/deployment (to be decided later)
- Any real payment settlement
