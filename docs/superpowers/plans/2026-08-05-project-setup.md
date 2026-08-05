# MITRAM Project Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the MITRAM booking website's technical foundation — scaffolded Next.js app, themed shadcn/ui, Prisma schema + local Postgres wired up and migrated, seed data (trip catalog + demo accounts) loaded, auth working end-to-end, and the MVC folder layout in place — so page/feature work can start on solid ground.

**Architecture:** Next.js App Router + TypeScript, shadcn/ui themed to the MITRAM maroon/gold/cream identity, Prisma ORM against a local PostgreSQL database, Auth.js (NextAuth v5) Credentials provider for email/password auth, TanStack Query for client-side data fetching in interactive flows.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Prisma, PostgreSQL (local), Auth.js v5 (`next-auth@beta`), @tanstack/react-query, zod, bcrypt. Package manager: **pnpm**.

This plan corresponds to spec: `docs/superpowers/specs/2026-08-05-mitram-booking-site-design.md`. It covers **setup only** — no pages/booking flow yet, per user direction to get the foundation solid first.

## Global Constraints

- Local PostgreSQL, default credentials (`postgres`/`postgres`, `localhost:5432`), database name `mitram` — no Docker.
- MVC-style layering: Models (`prisma/schema.prisma` + `src/server/models`), Controllers (`src/app/api/**/route.ts` — thin, no business logic), Services (`src/server/services/*` — all Prisma queries + domain rules), Views (`src/app/**/page.tsx` + `src/components/**`).
- shadcn/ui themed via CSS variables in `globals.css` (`:root` + `.dark`), semantic naming (`--primary`/`--primary-foreground`), never hardcoded Tailwind colors in components.
- Brand: Primary maroon `#8B1A1A`, accent gold `#F5A623`, background cream `#FFFDF5`, headings Playfair Display, body DM Sans.
- Every integration wired per its official docs (Next.js, Prisma, Auth.js, shadcn/ui). If an official doc can't be found or is ambiguous, stop and ask rather than guessing from a third-party tutorial.
- Email/password auth only for this MVP (no OTP/phone).

---

### Task 1: Scaffold the Next.js project

**Files:**
- Create: entire project root (via `create-next-app`) at `/Users/harsh/Desktop/Data/Dhruvi/mitram`
- Create: `.gitignore`, `.env`, `.env.example`

**Interfaces:**
- Produces: a running Next.js dev server at `localhost:3000`, TypeScript configured, App Router under `src/app`, import alias `@/*` → `src/*`.

- [ ] **Step 1: Initialize git (the directory isn't a repo yet)**

```bash
cd /Users/harsh/Desktop/Data/Dhruvi/mitram
git init
```

- [ ] **Step 2: Scaffold with the official Next.js CLI**

Per Next.js official docs (`npx create-next-app@latest`), scaffold into the current directory with TypeScript, Tailwind, App Router, `src/` directory, and the `@/*` import alias:

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --eslint --use-pnpm --no-turbopack
```

When prompted about the non-empty directory (the `docs/` folder already exists), confirm to proceed.

- [ ] **Step 3: Verify the dev server runs**

```bash
pnpm dev
```

Expected: server starts on `http://localhost:3000`, default Next.js welcome page loads with no errors. Stop the server (Ctrl+C) once confirmed.

- [ ] **Step 4: Create `.env` and `.env.example`**

`.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mitram?schema=public"
AUTH_SECRET="replace-with-generated-secret"
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

`.env.example` (same keys, empty/placeholder values, safe to commit):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mitram?schema=public"
AUTH_SECRET=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

- [ ] **Step 5: Confirm `.env` is gitignored, then commit**

Check `.gitignore` includes `.env` (create-next-app's default `.gitignore` already excludes `.env*.local` but not plain `.env` — add `.env` explicitly if missing, keep `.env.example` tracked).

```bash
git add -A
git commit -m "chore: scaffold Next.js project"
```

---

### Task 2: Install and theme shadcn/ui

**Files:**
- Create: `components.json` (via shadcn init)
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts` (if shadcn init doesn't fully cover font family tokens)
- Create: `src/lib/utils.ts` (via shadcn init)

**Interfaces:**
- Produces: `cn()` utility from `@/lib/utils`, theme CSS variables consumable as `bg-primary`, `text-primary-foreground`, etc.

- [ ] **Step 1: Run the official shadcn init**

```bash
pnpm dlx shadcn@latest init
```

Choose: base color **Neutral** (we override with our own CSS variables next), CSS variables **Yes**.

- [ ] **Step 2: Verify shadcn MCP sees the project**

Now that `components.json` exists, use the `shadcn` MCP's `get_project_registries` tool to confirm the registry is configured correctly (should show `@shadcn` as the default registry). This confirms later component installs (`get_add_command_for_items`) will target the right project.

- [ ] **Step 3: Add Google Fonts (Playfair Display + DM Sans) in the root layout**

In `src/app/layout.tsx`, replace the default font imports with:

```tsx
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
```

And apply both variable classes to the `<body>` (or `<html>`) element: `className={`${playfair.variable} ${dmSans.variable} font-body`}`.

- [ ] **Step 4: Override the theme CSS variables in `globals.css`**

Replace the `:root` and `.dark` blocks shadcn generated with the MITRAM palette (HSL values, per shadcn's official theming convention):

```css
:root {
  --background: 48 100% 98%;        /* #FFFDF5 cream */
  --foreground: 0 0% 10%;
  --primary: 0 68% 32%;             /* #8B1A1A maroon */
  --primary-foreground: 48 100% 98%;
  --secondary: 40 20% 94%;
  --secondary-foreground: 0 68% 32%;
  --accent: 38 90% 57%;             /* #F5A623 gold */
  --accent-foreground: 0 0% 10%;
  --muted: 40 20% 94%;
  --muted-foreground: 0 0% 40%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 10%;
  --border: 40 15% 88%;
  --input: 40 15% 88%;
  --ring: 0 68% 32%;
  --destructive: 0 72% 42%;
  --destructive-foreground: 0 0% 100%;
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 8%;
  --foreground: 40 30% 92%;
  --primary: 0 60% 55%;
  --primary-foreground: 0 0% 8%;
  --secondary: 0 0% 14%;
  --secondary-foreground: 40 30% 92%;
  --accent: 38 85% 60%;
  --accent-foreground: 0 0% 8%;
  --muted: 0 0% 14%;
  --muted-foreground: 40 10% 65%;
  --card: 0 0% 12%;
  --card-foreground: 40 30% 92%;
  --border: 0 0% 20%;
  --input: 0 0% 20%;
  --ring: 0 60% 55%;
  --destructive: 0 62% 50%;
  --destructive-foreground: 0 0% 100%;
}
```

Add font-family Tailwind theme tokens (Tailwind v4 `@theme` block in `globals.css`, since shadcn's Next.js template uses Tailwind v4 by default):

```css
@theme inline {
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
}
```

Then headings use `font-heading` and body text defaults to `font-body`.

- [ ] **Step 5: Add the first shadcn components needed across the app**

Use the shadcn MCP to get the correct add command, then run it:

```bash
pnpm dlx shadcn@latest add button card input label form dialog badge avatar separator navigation-menu
```

- [ ] **Step 6: Verify theming visually**

Temporarily render a `<Button>` and a `<Card>` with some text on the home page, run `pnpm dev`, confirm in the browser that the button is maroon (`bg-primary`) with cream/white text, background is cream, heading font is a visible serif. Revert the temporary render after confirming (keep `page.tsx` at the default scaffold content — real home page content comes in a later plan).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: install and theme shadcn/ui with MITRAM brand palette"
```

---

### Task 3: Install Prisma and connect to local PostgreSQL

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json` (prisma dependency + `prisma.seed` config)
- Modify: `.env` (already has `DATABASE_URL` from Task 1)
- Create: `src/server/db.ts` (Prisma client singleton)

**Interfaces:**
- Produces: `prisma` export from `@/server/db` — the single Prisma client instance every service imports.

- [ ] **Step 1: Confirm local Postgres is reachable and create the database**

```bash
psql -U postgres -h localhost -c "CREATE DATABASE mitram;"
```

If this fails with an auth error, stop and ask the user for their actual local Postgres credentials rather than guessing further (per the global constraint to confirm rather than assume when official setup diverges).

- [ ] **Step 2: Install Prisma per official docs**

```bash
pnpm add -D prisma
pnpm add @prisma/client
pnpm dlx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and confirms `.env`'s `DATABASE_URL` format — `prisma init` won't overwrite the existing `.env`, it appends if the key is missing (verify `DATABASE_URL` still matches Task 1's value after this step).

- [ ] **Step 3: Create the Prisma client singleton**

`src/server/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

This is the official Next.js + Prisma pattern for avoiding duplicate client instances under hot reload in dev.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: install Prisma and connect to local Postgres"
```

---

### Task 4: Define the full Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `User`, `TravelerProfile`, `Trip`, `TripDay`, `Booking`, `Payment`, `TripUpdate` Prisma models — every later task (auth, services, seed) depends on these exact model/field names.

- [ ] **Step 1: Write the full schema**

`prisma/schema.prisma` (datasource/generator blocks already exist from `prisma init` — append the models):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  traveler
  nri
}

enum BookedFor {
  self
  parent
  nri
}

enum BookingStatus {
  pending
  confirmed
  upcoming
  ongoing
  completed
  cancelled
}

enum PaymentStatus {
  created
  paid
  failed
}

enum HealthStatus {
  ok
  monitor
}

model User {
  id              String            @id @default(cuid())
  email           String            @unique
  passwordHash    String
  name            String
  phone           String?
  role            UserRole          @default(traveler)
  travelerProfiles TravelerProfile[]
  bookings        Booking[]
  createdAt       DateTime          @default(now())
}

model TravelerProfile {
  id           String    @id @default(cuid())
  user         User      @relation(fields: [userId], references: [id])
  userId       String
  name         String
  age          Int
  relationship String    // "self" | "parent" | "other"
  healthNotes  String[]  @default([])
  dietaryNeeds String[]  @default([])
  bookings     Booking[]
  createdAt    DateTime  @default(now())
}

model Trip {
  id            String     @id @default(cuid())
  slug          String     @unique
  title         String
  category      String     // "pilgrimage" | "international" | "heritage" | "hill"
  routeSummary  String
  durationDays  Int
  durationNights Int
  basePrice     Int        // INR, smallest currency unit not required for MVP
  images        String[]   @default([])
  careFeatures  String[]   @default([])
  inclusions    String[]   @default([])
  summary       String
  days          TripDay[]
  bookings      Booking[]
  createdAt     DateTime   @default(now())
}

model TripDay {
  id          String   @id @default(cuid())
  trip        Trip     @relation(fields: [tripId], references: [id])
  tripId      String
  dayNumber   Int
  title       String
  description String
  activities  String[] @default([])

  @@unique([tripId, dayNumber])
}

model Booking {
  id                  String            @id @default(cuid())
  user                User              @relation(fields: [userId], references: [id])
  userId              String
  trip                Trip              @relation(fields: [tripId], references: [id])
  tripId              String
  bookedFor           BookedFor
  travelers           TravelerProfile[]
  numTravelers        Int
  roomType             String
  specialCareRequests String[]          @default([])
  totalAmount         Int
  status              BookingStatus     @default(pending)
  trackingVisible     Boolean           @default(true)
  payment             Payment?
  tripUpdates         TripUpdate[]
  createdAt           DateTime          @default(now())
}

model Payment {
  id               String        @id @default(cuid())
  booking          Booking       @relation(fields: [bookingId], references: [id])
  bookingId        String        @unique
  razorpayOrderId  String?
  razorpayPaymentId String?
  status           PaymentStatus @default(created)
  amount           Int
  createdAt        DateTime      @default(now())
}

model TripUpdate {
  id             String       @id @default(cuid())
  booking        Booking      @relation(fields: [bookingId], references: [id])
  bookingId      String
  timestamp      DateTime
  locationLabel  String
  lat            Float?
  lng            Float?
  note           String?
  photoUrl       String?
  healthBp       String?
  healthSugar    String?
  healthTemp     String?
  healthStatus   HealthStatus?

  @@index([bookingId, timestamp])
}
```

Note: `Booking.travelers` is a many-to-many with `TravelerProfile` (a booking can cover more than one senior; a profile can appear on multiple bookings) — Prisma will create an implicit join table since no explicit fields are given.

- [ ] **Step 2: Run the first migration**

```bash
pnpm dlx prisma migrate dev --name init
```

Expected: migration applies cleanly against the local `mitram` database, Prisma Client regenerates with no type errors.

- [ ] **Step 3: Verify with Prisma Studio**

```bash
pnpm dlx prisma studio
```

Expected: browser opens showing all 7 empty tables (User, TravelerProfile, Trip, TripDay, Booking, Payment, TripUpdate). Close it once confirmed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: define Prisma schema and run initial migration"
```

---

### Task 5: Seed the database with real trip content and demo accounts

**Files:**
- Create: `prisma/seed.ts`
- Create: `prisma/seed-data/trips.ts`
- Modify: `package.json` (add `prisma.seed` script entry)

**Interfaces:**
- Consumes: Prisma models from Task 4 (`prisma.trip.create`, etc.)
- Produces: a repeatable `pnpm dlx prisma db seed` command; downstream page/feature tasks assume this data exists (specific trip slugs referenced below).

- [ ] **Step 1: Register the seed script in `package.json`**

Add to `package.json` (top-level key):

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

```bash
pnpm add -D tsx
```

- [ ] **Step 2: Write the trip seed data**

`prisma/seed-data/trips.ts` — real content transcribed from the source itineraries (2 trips get full day-by-day detail, the rest get shorter summaries, matching the spec's §5):

```ts
export const trips = [
  {
    slug: "sammed-shikharji-yatra",
    title: "Sammed Shikharji Yatra",
    category: "pilgrimage",
    routeSummary: "Delhi → Deoghar → Madhuban",
    durationDays: 4,
    durationNights: 3,
    basePrice: 33999,
    images: [],
    careFeatures: [
      "BP & sugar monitoring twice daily",
      "Verified Saathi companion",
      "9 Tonks assisted darshan",
      "Medical attendant on route",
    ],
    inclusions: [
      "Jain Satvik Meals",
      "Bike Trek Assist",
      "Medical Attendant · Oxygen Cylinder",
      "Live WhatsApp Family Updates",
    ],
    summary:
      "A 4-day, 3-night assisted pilgrimage to the Sammed Shikharji Jain Tirtha, with companion support across all 9 Tonks.",
    days: [
      {
        dayNumber: 1,
        title: "Delhi → Deoghar",
        description: "Departure from Delhi, arrival and rest in Deoghar ahead of the yatra.",
        activities: ["Morning departure", "Evening arrival in Deoghar", "Health check-in and briefing"],
      },
      {
        dayNumber: 2,
        title: "Deoghar → Madhuban",
        description: "Transfer to Madhuban, the base for the Shikharji ascent.",
        activities: ["Assisted transfer", "Rest and acclimatization", "Route briefing for the Tonk circuit"],
      },
      {
        dayNumber: 3,
        title: "Assisted Tonk darshan",
        description: "Guided, paced darshan across the 9 Tonks with companion and medical support.",
        activities: ["Early departure with companion", "Assisted darshan at multiple Tonks", "Return to Madhuban, evening health check-in"],
      },
      {
        dayNumber: 4,
        title: "Madhuban → Delhi",
        description: "Return journey with a final family health summary shared on arrival.",
        activities: ["Morning check-out", "Return travel to Delhi", "Family notified of safe return"],
      },
    ],
  },
  {
    slug: "dwarka-rann-of-kutch",
    title: "Dwarka + Rann of Kutch Spiritual & Heritage Yatra",
    category: "pilgrimage",
    routeSummary: "Ahmedabad → Dwarka → Beyt Dwarka → Shivrajpur → Mundra → Rann of Kutch → Ahmedabad",
    durationDays: 7,
    durationNights: 6,
    basePrice: 48000,
    images: [],
    careFeatures: [
      "Assisted boat boarding with life jackets",
      "Wheelchair access paths at White Rann",
      "Medical checks and hydration reminders",
      "Minimal walking, vehicle-based sightseeing",
    ],
    inclusions: [
      "Senior-friendly hotels with lifts",
      "Assisted darshan at all temple stops",
      "Bus-based Adani Port orientation",
      "Cultural folk music evenings",
    ],
    summary:
      "From Krishna's Dwarka to the White Rann — a 7-day, 6-night journey of devotion, heritage, and modern India, paced for ages 45-95.",
    days: [
      { dayNumber: 1, title: "Ahmedabad → Dwarka", description: "Arrival and settling, evening Gomti Ghat aarti viewing (seated).", activities: ["Morning pickup from Ahmedabad", "Comfortable transfer with rest stops", "Evening Gomti Ghat visit", "Early dinner and rest"] },
      { dayNumber: 2, title: "Dwarka Temple Circuit", description: "Assisted darshan block with walking kept minimal throughout.", activities: ["Dwarkadhish Temple priority senior darshan", "Rukmini Devi Temple", "Optional Gita Mandir or Swaminarayan Mandir evening visit"] },
      { dayNumber: 3, title: "Nageshwar Jyotirlinga → Beyt Dwarka → Shivrajpur", description: "Jyotirlinga darshan combined with Mahabharata-linked Beyt Dwarka and a beach sunset stop.", activities: ["Nageshwar Jyotirlinga, flat access", "Assisted boat crossing to Beyt Dwarka", "Sunset at Shivrajpur Beach, wheelchairs available"] },
      { dayNumber: 4, title: "Dwarka → Mundra (Adani Port)", description: "A bus-based, no-walking-required orientation of India's modern maritime infrastructure.", activities: ["Late breakfast and relaxed drive", "Guided Adani Port viewing from the bus", "Early dinner"] },
      { dayNumber: 5, title: "Mundra → Bhuj → Rann of Kutch", description: "Crafts village visit followed by a wheelchair-accessible White Rann sunset.", activities: ["Bhuj crafts village, seated demonstrations", "White Rann sunset visit", "Seated cultural folk music"] },
      { dayNumber: 6, title: "Rann of Kutch → Bhuj", description: "A leisure and culture day with optional temple visit and assisted shopping.", activities: ["Late wake-up", "Optional local temple visit", "Assisted handicraft shopping"] },
      { dayNumber: 7, title: "Bhuj → Ahmedabad", description: "Comfortable return journey with assisted drop-offs.", activities: ["Comfortable return drive", "Assisted drop-offs", "Family notified of safe return"] },
    ],
  },
  {
    slug: "char-dham-yatra",
    title: "Char Dham Yatra — Fully Assisted",
    category: "pilgrimage",
    routeSummary: "Yamunotri → Gangotri → Kedarnath → Badrinath",
    durationDays: 11,
    durationNights: 10,
    basePrice: 52999,
    images: [],
    careFeatures: ["Wheelchair & porter support", "Daily health vitals check", "Dedicated MITRAM Saathi companion"],
    inclusions: ["4 Star Hotels", "AC Transport", "All Meals", "Flight options available"],
    summary: "The complete Char Dham circuit, fully assisted for senior travelers with daily health monitoring.",
    days: [],
  },
  {
    slug: "vaishno-devi-yatra",
    title: "Vaishno Devi Yatra",
    category: "pilgrimage",
    routeSummary: "Delhi → Jammu → Katra",
    durationDays: 6,
    durationNights: 5,
    basePrice: 28999,
    images: [],
    careFeatures: ["Medical kit on route", "Live GPS family updates"],
    inclusions: ["Pony / Pittu option", "Hotel", "All meals", "Train options available"],
    summary: "A dignity-paced Vaishno Devi pilgrimage with pony/palanquin assistance and live family updates.",
    days: [],
  },
  {
    slug: "jannat-e-kashmir-vistadome",
    title: "Jannat-e-Kashmir by Vistadome Train",
    category: "heritage",
    routeSummary: "Delhi → Udhampur → Srinagar",
    durationDays: 8,
    durationNights: 7,
    basePrice: 44999,
    images: [],
    careFeatures: ["Altitude medical support", "Slow-paced itinerary"],
    inclusions: ["Vistadome train", "Houseboat stay", "Dal Lake", "All meals", "Airport transfers"],
    summary: "A scenic, slow-paced Kashmir journey by Vistadome train, houseboat, and Dal Lake.",
    days: [],
  },
  {
    slug: "maharashtra-jyotirlinga-circuit",
    title: "Maharashtra Jyotirlinga Circuit",
    category: "pilgrimage",
    routeSummary: "Mumbai → Trimbakeshwar → Grishneshwar → Shirdi → Bhimashankar → Pune → Mumbai",
    durationDays: 7,
    durationNights: 6,
    basePrice: 39999,
    images: [],
    careFeatures: [
      "1 MITRAM Coordinator for every 8 seniors",
      "Wheelchairs, first-aid, motion-sickness kits, BP/sugar checks",
      "Emergency escalation plan and insurance guidance",
    ],
    inclusions: ["AC low-step coach with attendant", "3-star senior-friendly hotels", "All breakfasts plus 4 prepaid meals", "MITRAM Live Tracker"],
    summary: "Four Jyotirlingas and Shirdi's Sai Baba, at a slow, assisted, dignity-first pace with no overnight drives.",
    days: [
      { dayNumber: 1, title: "Mumbai → Nashik", description: "Scenic drive via Kasara Ghat with a mid-morning breakfast stop.", activities: ["Home pickups across Mumbai", "Breakfast stop at Shahapur", "Hotel check-in and mandatory rest"] },
      { dayNumber: 2, title: "Trimbakeshwar Jyotirlinga & Godavari Aarti", description: "Assisted darshan at one of the 12 Jyotirlingas, at the source of the Godavari.", activities: ["Assisted Trimbakeshwar darshan and Rudrabhishek", "Optional Brahmagiri viewpoint", "Seated Godavari Aarti"] },
      { dayNumber: 3, title: "Nashik → Aurangabad", description: "Comfortable travel day with extra rest breaks.", activities: ["Depart Nashik", "Lunch en route", "Evening rest and briefing in Aurangabad"] },
      { dayNumber: 4, title: "Grishneshwar Jyotirlinga → Shirdi", description: "The final Jyotirlinga, followed by transfer to Shirdi.", activities: ["Assisted Grishneshwar darshan", "Optional flat-area Ellora highlights", "Drive to Shirdi with rest breaks"] },
      { dayNumber: 5, title: "Shirdi Sai Baba — full darshan and rest day", description: "A full day at Shirdi with assisted darshan and an evening satsang.", activities: ["Assisted Sai Baba darshan", "Dwarkamai and Chavadi visit", "Evening aarti and bhajan"] },
      { dayNumber: 6, title: "Shirdi → Bhimashankar → Pune", description: "Assisted darshan at the forest-set Bhimashankar Jyotirlinga, then on to Pune.", activities: ["Morning drive with breaks", "Assisted Bhimashankar darshan", "Celebration dinner in Pune"] },
      { dayNumber: 7, title: "Pune → Mumbai", description: "Return journey with a final family health summary.", activities: ["Breakfast and check-out", "Return drive with lunch stop", "Home drop-offs across Mumbai"] },
    ],
  },
];

export const internationalTrips = [
  { slug: "bhutan-gentle-himalaya", title: "Bhutan — Gentle Himalaya", category: "international", routeSummary: "Paro → Thimphu → Punakha", durationDays: 6, durationNights: 5, basePrice: 89999, images: [], careFeatures: ["Low-altitude itinerary", "Oxygen support on standby"], inclusions: ["Visa assistance", "All meals", "AC transport"], summary: "A gentle, low-altitude introduction to Bhutan's monasteries and valleys.", days: [] },
  { slug: "spain-portugal-heritage", title: "Spain & Portugal Heritage", category: "international", routeSummary: "Madrid → Lisbon → Porto", durationDays: 10, durationNights: 9, basePrice: 189999, images: [], careFeatures: ["English/Hindi-speaking coordinator", "Wheelchair-accessible coach"], inclusions: ["4-star hotels", "Daily breakfast", "Guided heritage tours"], summary: "Iberian heritage at a relaxed, senior-friendly pace.", days: [] },
];
```

- [ ] **Step 3: Write the main seed script**

`prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { trips, internationalTrips } from "./seed-data/trips";

const prisma = new PrismaClient();

async function main() {
  for (const trip of [...trips, ...internationalTrips]) {
    const { days, ...tripData } = trip;
    await prisma.trip.upsert({
      where: { slug: trip.slug },
      update: {},
      create: {
        ...tripData,
        days: { create: days },
      },
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "arjun.jain@example.com" },
    update: {},
    create: {
      email: "arjun.jain@example.com",
      passwordHash,
      name: "Arjun Jain",
      phone: "+971501234567",
      role: "nri",
    },
  });

  const parentProfile = await prisma.travelerProfile.upsert({
    where: { id: "demo-traveler-ramesh" },
    update: {},
    create: {
      id: "demo-traveler-ramesh",
      userId: demoUser.id,
      name: "Ramesh Jain",
      age: 72,
      relationship: "parent",
      healthNotes: ["Hypertensive", "Type 2 Diabetes"],
      dietaryNeeds: ["Jain Satvik"],
    },
  });

  const shikharji = await prisma.trip.findUniqueOrThrow({ where: { slug: "sammed-shikharji-yatra" } });

  const demoBooking = await prisma.booking.upsert({
    where: { id: "demo-booking-1" },
    update: {},
    create: {
      id: "demo-booking-1",
      userId: demoUser.id,
      tripId: shikharji.id,
      bookedFor: "parent",
      travelers: { connect: [{ id: parentProfile.id }] },
      numTravelers: 1,
      roomType: "single",
      specialCareRequests: ["Jain satvik meals", "BP monitoring twice daily"],
      totalAmount: shikharji.basePrice,
      status: "ongoing",
      trackingVisible: true,
    },
  });

  await prisma.payment.upsert({
    where: { bookingId: demoBooking.id },
    update: {},
    create: {
      bookingId: demoBooking.id,
      razorpayOrderId: "order_demo_seed",
      razorpayPaymentId: "pay_demo_seed",
      status: "paid",
      amount: shikharji.basePrice,
    },
  });

  const baseTime = new Date("2026-02-17T06:00:00+05:30");
  const updates = [
    { hoursOffset: 0, locationLabel: "Departed Deoghar", note: "Group departed for Madhuban, all well.", healthStatus: "ok" as const, healthBp: "126/82", healthSugar: "108", healthTemp: "98.2" },
    { hoursOffset: 3, locationLabel: "Tonk 4 — Ajitnath Temple", note: "Papa is at Tonk 4 · All well · BP normal", healthStatus: "ok" as const, healthBp: "128/84", healthSugar: "112", healthTemp: "98.4" },
    { hoursOffset: 6, locationLabel: "Returned to Madhuban", note: "Evening rest, medication administered on schedule.", healthStatus: "ok" as const, healthBp: "124/80", healthSugar: "110", healthTemp: "98.3" },
  ];

  for (const u of updates) {
    await prisma.tripUpdate.create({
      data: {
        bookingId: demoBooking.id,
        timestamp: new Date(baseTime.getTime() + u.hoursOffset * 3600 * 1000),
        locationLabel: u.locationLabel,
        note: u.note,
        healthStatus: u.healthStatus,
        healthBp: u.healthBp,
        healthSugar: u.healthSugar,
        healthTemp: u.healthTemp,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 4: Install bcrypt and run the seed**

```bash
pnpm add bcrypt
pnpm add -D @types/bcrypt
pnpm dlx prisma db seed
```

Expected: "Seed complete." printed, no errors.

- [ ] **Step 5: Verify in Prisma Studio**

```bash
pnpm dlx prisma studio
```

Expected: 8 trips in `Trip`, 4 `TripDay` rows for Shikharji, 7 for the Jyotirlinga circuit, 1 demo `User`, 1 `TravelerProfile`, 1 `Booking` with status `ongoing`, 1 `Payment` with status `paid`, 3 `TripUpdate` rows. Close Studio once confirmed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: seed trip catalog and demo booking data"
```

---

### Task 6: Wire up Auth.js (NextAuth v5) with the Credentials provider

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/server/services/authService.ts`
- Create: `src/middleware.ts`
- Modify: `.env` (`AUTH_SECRET` generated)

**Interfaces:**
- Consumes: `prisma` from `@/server/db` (Task 3), `User` model (Task 4).
- Produces: `auth()`, `signIn()`, `signOut()` exports from `@/auth`; `authService.registerUser(email, password, name)` and `authService.verifyCredentials(email, password)` — later signup/login pages call these directly.

- [ ] **Step 1: Install Auth.js v5 per official docs**

```bash
pnpm add next-auth@beta
```

- [ ] **Step 2: Generate the auth secret**

```bash
pnpm dlx auth secret
```

This writes `AUTH_SECRET` into `.env` automatically per Auth.js's official CLI (confirm it landed in `.env`, not `.env.local`, to stay consistent with Task 1's setup).

- [ ] **Step 3: Write the auth service (business logic layer)**

`src/server/services/authService.ts`:

```ts
import bcrypt from "bcrypt";
import { prisma } from "@/server/db";

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function registerUser(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: "traveler" },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
```

- [ ] **Step 4: Configure Auth.js with the Credentials provider**

`src/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyCredentials } from "@/server/services/authService";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await verifyCredentials(
          credentials.email as string,
          credentials.password as string
        );
        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 5: Add the route handler**

`src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 6: Add route protection middleware**

`src/middleware.ts`:

```ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/book"];

export default auth((req) => {
  const isProtected = protectedPrefixes.some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/book/:path*"],
};
```

- [ ] **Step 7: Verify with a temporary test route**

Create a throwaway `src/app/api/_auth-check/route.ts`:

```ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  return NextResponse.json({ session });
}
```

Run `pnpm dev`, visit `http://localhost:3000/api/_auth-check`, confirm it returns `{"session":null}` with no server error. Delete this test route once confirmed — it isn't part of the app.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire up Auth.js credentials provider and route protection"
```

---

### Task 7: Set up TanStack Query provider

**Files:**
- Create: `src/components/providers/query-provider.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `<QueryProvider>` wrapping the app — later client components use `useQuery`/`useMutation` from `@tanstack/react-query` directly, no further setup needed.

- [ ] **Step 1: Install per official docs**

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

- [ ] **Step 2: Create the provider (official Next.js App Router pattern — client component holding the QueryClient in state so it isn't recreated on every render)**

`src/components/providers/query-provider.tsx`:

```tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 3: Wrap the root layout**

In `src/app/layout.tsx`, import `QueryProvider` and wrap `{children}` with it inside the `<body>`.

- [ ] **Step 4: Verify no runtime errors**

```bash
pnpm dev
```

Visit `http://localhost:3000`, confirm the page still loads with no console errors (QueryProvider is inert until a page actually calls `useQuery`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add TanStack Query provider"
```

---

### Task 8: Scaffold the MVC service/controller folder structure

**Files:**
- Create: `src/server/services/tripService.ts`
- Create: `src/server/services/bookingService.ts`
- Create: `src/app/api/trips/route.ts`
- Create: `src/app/api/trips/[slug]/route.ts`

**Interfaces:**
- Consumes: `prisma` from `@/server/db`.
- Produces: `tripService.listTrips()`, `tripService.getTripBySlug(slug)` — the exact functions the trip listing/detail pages (next plan) will call, either directly (server components) or via these API routes (client components using TanStack Query).

- [ ] **Step 1: Write `tripService`**

`src/server/services/tripService.ts`:

```ts
import { prisma } from "@/server/db";

export function listTrips() {
  return prisma.trip.findMany({
    orderBy: { title: "asc" },
  });
}

export function getTripBySlug(slug: string) {
  return prisma.trip.findUnique({
    where: { slug },
    include: { days: { orderBy: { dayNumber: "asc" } } },
  });
}
```

- [ ] **Step 2: Write a starter `bookingService` (extended in the next plan)**

`src/server/services/bookingService.ts`:

```ts
import { prisma } from "@/server/db";

export function listBookingsForUser(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { trip: true, travelers: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      trip: { include: { days: { orderBy: { dayNumber: "asc" } } } },
      travelers: true,
      payment: true,
      tripUpdates: { orderBy: { timestamp: "asc" } },
    },
  });
}
```

- [ ] **Step 3: Write the trips API controllers (thin — parse, call service, respond)**

`src/app/api/trips/route.ts`:

```ts
import { NextResponse } from "next/server";
import { listTrips } from "@/server/services/tripService";

export async function GET() {
  const trips = await listTrips();
  return NextResponse.json(trips);
}
```

`src/app/api/trips/[slug]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getTripBySlug } from "@/server/services/tripService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}
```

- [ ] **Step 4: Verify the API routes work end-to-end against seeded data**

```bash
pnpm dev
```

In another terminal:

```bash
curl http://localhost:3000/api/trips | head -c 500
curl http://localhost:3000/api/trips/sammed-shikharji-yatra | head -c 500
curl -i http://localhost:3000/api/trips/does-not-exist
```

Expected: first call returns a JSON array of 8 trips; second returns the Shikharji trip with its 4 nested `days`; third returns HTTP 404 with `{"error":"Trip not found"}`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold trip service layer and API routes"
```

---

## Definition of done for this plan

- `pnpm dev` starts cleanly, home page renders with MITRAM theming (maroon/gold/cream, Playfair Display headings) visible via the temporary Task 2 check.
- `pnpm dlx prisma studio` shows 8 seeded trips (2 with full day-by-day itineraries), 1 demo user/booking/tripUpdates set.
- `/api/trips` and `/api/trips/[slug]` return real seeded data.
- `/api/_auth-check` confirms Auth.js is wired (then deleted).
- Everything is committed to git in small, working-state commits.
- **Not yet built** (next plan): actual home/trips/booking/dashboard pages, Razorpay integration, the live-tracking UI itself (data model + seed data exist; the map/timeline components don't yet).
