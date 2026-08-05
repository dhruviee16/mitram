# MITRAM Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/dashboard` (bookings list) and `/dashboard/bookings/[id]` (detail + live tracking), completing the loop from the confirmation page's "View my bookings" link and the original booking-site spec's live-tracking requirement.

**Architecture:** Server components for the list and detail pages (session-gated by the existing proxy matcher, ownership-checked independently per route). The tracking-visibility toggle is the one genuinely interactive piece — a small client component using a TanStack Query mutation hook, consistent with the booking wizard's pattern.

**Tech Stack:** Next.js App Router, existing `bookingService`, shadcn `Switch` (new install), `Badge`, `lucide-react`, TanStack Query.

This plan corresponds to spec: `docs/superpowers/specs/2026-08-06-dashboard-design.md`.

## Global Constraints

- `/dashboard/bookings/[id]` and the tracking-visibility route both independently verify `booking.userId === session.user.id` — `notFound()`/403 on mismatch, same pattern as the confirmation page.
- No real map SDK — stylized/illustrative tracking visualization only.
- Live Tracking panel renders only when `booking.status === "ongoing"` — no placeholder/disabled state for other statuses.
- WCAG 2.1 AA: gold-contrast rule, real alt text, one `<h1>` per page, visible focus rings, `Switch` paired with a real `Label`, pulse animation respects `prefers-reduced-motion`.

---

### Task 1: `setTrackingVisibility` service function + PATCH route

**Files:**
- Modify: `src/server/services/bookingService.ts`
- Modify: `src/lib/validations/booking.ts`
- Create: `src/app/api/bookings/[id]/tracking-visibility/route.ts`

**Interfaces:**
- Produces: `trackingVisibilitySchema` (zod), `setTrackingVisibility(bookingId, userId, visible)` in `bookingService`, `PATCH /api/bookings/[id]/tracking-visibility` — consumed by Task 4's mutation hook.

- [ ] **Step 1: Add the zod schema**

Append to `src/lib/validations/booking.ts`:

```ts
export const trackingVisibilitySchema = z.object({
  visible: z.boolean(),
});
```

- [ ] **Step 2: Add the service function**

Append to `src/server/services/bookingService.ts`:

```ts
export async function setTrackingVisibility(bookingId: string, userId: string, visible: boolean) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== userId) {
    throw new Error("Booking not found.");
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { trackingVisible: visible },
  });

  return { trackingVisible: updated.trackingVisible };
}
```

- [ ] **Step 3: Write the controller**

`src/app/api/bookings/[id]/tracking-visibility/route.ts`:

```ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { trackingVisibilitySchema } from "@/lib/validations/booking";
import { setTrackingVisibility } from "@/server/services/bookingService";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = trackingVisibilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  try {
    const result = await setTrackingVisibility(id, session.user.id, parsed.data.visible);
    return NextResponse.json(result);
  } catch (err) {
    console.error("setTrackingVisibility failed:", err);
    const message = err instanceof Error ? err.message : "Could not update visibility.";
    return NextResponse.json(
      { error: message },
      { status: message === "Booking not found." ? 404 : 500 }
    );
  }
}
```

- [ ] **Step 4: Verify**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

```bash
curl -s -i -X PATCH http://localhost:3000/api/bookings/demo-booking-1/tracking-visibility \
  -H "Content-Type: application/json" -d '{"visible":false}'
```

Expected: `401 {"error":"Not signed in."}` (confirms the route independently enforces auth). Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add tracking-visibility service function and API route"
```

---

### Task 2: Bookings list (`/dashboard`)

**Files:**
- Create: `src/components/dashboard/booking-card.tsx`
- Create: `src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `listBookingsForUser` (already exists), `auth()`.
- Produces: `/dashboard` route.

- [ ] **Step 1: Booking card**

`src/components/dashboard/booking-card.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=400&q=70";

type BookingCardBooking = {
  id: string;
  status: string;
  roomType: string;
  totalAmount: number;
  trip: {
    title: string;
    routeSummary: string;
    images: string[];
  };
};

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  ongoing: "default",
  upcoming: "secondary",
  pending: "secondary",
  completed: "secondary",
  cancelled: "destructive",
};

export function BookingCard({ booking }: { booking: BookingCardBooking }) {
  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className="flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md">
        <Image
          src={booking.trip.images[0] ?? FALLBACK_IMAGE}
          alt={booking.trip.title}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-heading text-base font-bold text-foreground">{booking.trip.title}</p>
          <Badge variant={statusVariant[booking.status] ?? "secondary"} className="capitalize shrink-0">
            {booking.status}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{booking.trip.routeSummary}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="capitalize text-muted-foreground">{booking.roomType} room</span>
          <span className="font-heading font-bold text-primary">
            ₹{booking.totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Dashboard page**

`src/app/dashboard/page.tsx`:

```tsx
import Link from "next/link";
import { auth } from "@/auth";
import { listBookingsForUser } from "@/server/services/bookingService";
import { BookingCard } from "@/components/dashboard/booking-card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const bookings = session?.user?.id ? await listBookingsForUser(session.user.id) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">You haven&rsquo;t booked a trip yet.</p>
          <Button className="mt-4" render={<Link href="/trips">Explore trips</Link>} />
        </div>
      ) : (
        <ul className="mt-6 space-y-4" role="list">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <BookingCard booking={booking} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify against real seeded data**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Log in as `arjun.jain@example.com` / `password123` in the browser, visit `http://localhost:3000/dashboard` — confirm the seeded `demo-booking-1` renders (Sammed Shikharji Yatra, `ongoing` badge, single room, ₹33,999) linking to `/dashboard/bookings/demo-booking-1` (404 for now — that's Task 3). Stop the server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add dashboard bookings list page"
```

---

### Task 3: Booking detail page (without tracking panel)

**Files:**
- Create: `src/components/dashboard/itinerary-recap.tsx`
- Create: `src/app/dashboard/bookings/[id]/page.tsx`

**Interfaces:**
- Consumes: `getBookingById` (already exists, includes `trip.days`, `travelers`, `payment`, `tripUpdates`).
- Produces: `/dashboard/bookings/[id]` route (Task 4 adds the Live Tracking panel on top of this).

- [ ] **Step 1: Read-only itinerary recap**

`src/components/dashboard/itinerary-recap.tsx`:

```tsx
type TripDay = {
  dayNumber: number;
  title: string;
  description: string;
};

export function ItineraryRecap({ days }: { days: TripDay[] }) {
  if (days.length === 0) return null;

  return (
    <section aria-labelledby="itinerary-recap-heading">
      <h2 id="itinerary-recap-heading" className="text-sm font-semibold text-foreground">
        Itinerary
      </h2>
      <ol className="mt-3 space-y-3">
        {days.map((day) => (
          <li key={day.dayNumber} className="flex gap-3 border-l-2 border-primary/30 pl-3 text-sm">
            <span className="shrink-0 font-heading font-bold text-primary">Day {day.dayNumber}</span>
            <div>
              <p className="font-semibold text-foreground">{day.title}</p>
              <p className="text-muted-foreground">{day.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 2: Booking detail page**

`src/app/dashboard/bookings/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/auth";
import { getBookingById } from "@/server/services/bookingService";
import { Badge } from "@/components/ui/badge";
import { ItineraryRecap } from "@/components/dashboard/itinerary-recap";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&q=70";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking || booking.userId !== session.user.id) {
    notFound();
  }

  const traveler = booking.travelers[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex gap-4">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md">
          <Image
            src={booking.trip.images[0] ?? FALLBACK_IMAGE}
            alt={booking.trip.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">{booking.trip.title}</h1>
          <p className="text-xs text-muted-foreground">{booking.trip.routeSummary}</p>
          <Badge className="mt-2 capitalize">{booking.status}</Badge>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Traveler</h2>
        {traveler && (
          <div className="mt-2 text-sm text-foreground">
            <p>
              {traveler.name}, {traveler.age} · {traveler.relationship}
            </p>
            {traveler.healthNotes.length > 0 && (
              <p className="mt-1 text-muted-foreground">
                Health notes: {traveler.healthNotes.join(", ")}
              </p>
            )}
            {traveler.dietaryNeeds.length > 0 && (
              <p className="text-muted-foreground">
                Dietary: {traveler.dietaryNeeds.join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Room</p>
            <p className="capitalize text-foreground">{booking.roomType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment</p>
            <p className="capitalize text-foreground">
              ₹{booking.totalAmount.toLocaleString("en-IN")} · {booking.payment?.status ?? "pending"}
            </p>
          </div>
        </div>

        {booking.specialCareRequests.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Care requests: {booking.specialCareRequests.join(", ")}
          </p>
        )}
      </div>

      <div className="mt-6">
        <ItineraryRecap days={booking.trip.days} />
      </div>

      {/* Live Tracking panel added in Task 4, only for status === "ongoing" */}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Visit `http://localhost:3000/dashboard/bookings/demo-booking-1` while logged in as `arjun.jain@example.com` — confirm real traveler (Ramesh Jain), room, payment status (`paid`), and the 4-day Shikharji itinerary all render. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add booking detail page with traveler, payment, and itinerary recap"
```

---

### Task 4: Live Tracking panel

**Files:**
- Create: `src/hooks/use-set-tracking-visibility.ts`
- Create: `src/components/dashboard/live-tracking-panel.tsx`
- Modify: `src/app/dashboard/bookings/[id]/page.tsx`

**Interfaces:**
- Consumes: `PATCH /api/bookings/[id]/tracking-visibility` (Task 1), `booking.tripUpdates` (already fetched by `getBookingById`).
- Produces: completes the booking detail page.

- [ ] **Step 1: Install shadcn Switch**

```bash
pnpm dlx shadcn@latest add switch
```

- [ ] **Step 2: Mutation hook**

`src/hooks/use-set-tracking-visibility.ts`:

```ts
import { useMutation } from "@tanstack/react-query";

type Input = { bookingId: string; visible: boolean };
type Result = { trackingVisible: boolean };

async function patchVisibility({ bookingId, visible }: Input): Promise<Result> {
  const res = await fetch(`/api/bookings/${bookingId}/tracking-visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visible }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not update visibility.");
  }
  return res.json();
}

export function useSetTrackingVisibility() {
  return useMutation({ mutationFn: patchVisibility });
}
```

- [ ] **Step 3: Live Tracking panel**

`src/components/dashboard/live-tracking-panel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { MapPin, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSetTrackingVisibility } from "@/hooks/use-set-tracking-visibility";

type TripUpdate = {
  id: string;
  timestamp: string | Date;
  locationLabel: string;
  note: string | null;
  healthBp: string | null;
  healthSugar: string | null;
  healthTemp: string | null;
  healthStatus: string | null;
};

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function LiveTrackingPanel({
  bookingId,
  trackingVisible,
  tripUpdates,
}: {
  bookingId: string;
  trackingVisible: boolean;
  tripUpdates: TripUpdate[];
}) {
  const [visible, setVisible] = useState(trackingVisible);
  const setTrackingVisibility = useSetTrackingVisibility();

  const latest = tripUpdates[tripUpdates.length - 1];

  function handleToggle(next: boolean) {
    setVisible(next);
    setTrackingVisibility.mutate(
      { bookingId, visible: next },
      {
        onError: () => {
          setVisible(!next);
          toast.error("Could not update visibility. Please try again.");
        },
      }
    );
  }

  return (
    <section aria-labelledby="tracking-heading" className="mt-6 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="tracking-heading" className="text-sm font-semibold text-foreground">
          Live Tracking
        </h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="tracking-visible-switch" className="text-xs text-muted-foreground">
            Visible to you
          </Label>
          <Switch
            id="tracking-visible-switch"
            checked={visible}
            onCheckedChange={handleToggle}
          />
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        On by default so you can follow the trip as it happens — turn off any time to keep it more private.
      </p>

      {visible && latest && (
        <>
          <div className="relative mt-4 h-32 overflow-hidden rounded-lg bg-gradient-to-br from-[#C8E6C9] via-[#A5D6A7] to-[#81C784]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="absolute size-12 rounded-full border-2 border-primary/40 motion-safe:animate-ping" />
              <MapPin className="size-8 fill-primary text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2">
              <p className="text-xs font-semibold text-white">{latest.locationLabel}</p>
              <p className="text-[11px] text-white/80">
                Updated {relativeTime(new Date(latest.timestamp))}
              </p>
            </div>
          </div>

          <ol className="mt-4 space-y-4">
            {[...tripUpdates].reverse().map((update) => (
              <li key={update.id} className="flex gap-3 border-l-2 border-primary/30 pl-3 text-sm">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{update.locationLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {relativeTime(new Date(update.timestamp))}
                  </p>
                  {update.note && <p className="mt-1 text-muted-foreground">{update.note}</p>}
                  {(update.healthBp || update.healthSugar || update.healthTemp) && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <HeartPulse className="size-3.5 text-primary" aria-hidden="true" />
                      {[update.healthBp, update.healthSugar, update.healthTemp]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {!visible && (
        <p className="mt-4 text-sm text-muted-foreground">
          Tracking is currently hidden. Turn it back on to see the latest updates.
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Wire into the booking detail page**

Modify `src/app/dashboard/bookings/[id]/page.tsx` — add the import and render the panel conditionally on `status === "ongoing"`:

```tsx
import { LiveTrackingPanel } from "@/components/dashboard/live-tracking-panel";
```

Replace the `{/* Live Tracking panel added in Task 4, only for status === "ongoing" */}` comment with:

```tsx
{booking.status === "ongoing" && (
  <LiveTrackingPanel
    bookingId={booking.id}
    trackingVisible={booking.trackingVisible}
    tripUpdates={booking.tripUpdates}
  />
)}
```

- [ ] **Step 5: Verify against real seeded data**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Visit `http://localhost:3000/dashboard/bookings/demo-booking-1` (status `ongoing`, 3 seeded `TripUpdate` rows) — confirm the map card shows "Returned to Madhuban" (the latest update) with a relative timestamp, the timeline shows all 3 updates newest-first with health data, and toggling the switch off hides the panel content and shows the "currently hidden" message. Toggle back on and refresh the page — confirm the visibility persisted (calls the real API route, updates the database). Stop the server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add live tracking panel with visibility toggle"
```

---

### Task 5: Cross-page verification

**Files:** No new files — verification and any small fixes found.

- [ ] **Step 1: Ownership check**

While logged in as a second test account (register one via `POST /api/auth/register` if needed), visit `http://localhost:3000/dashboard/bookings/demo-booking-1` (owned by `arjun.jain@example.com`) — confirm it 404s. Clean up the test account afterward.

- [ ] **Step 2: Empty-state check**

Log in as the fresh test account from Step 1 (before deleting it) and visit `/dashboard` — confirm the empty state renders ("You haven't booked a trip yet" + Explore trips CTA) rather than a blank page.

- [ ] **Step 3: Keyboard-only pass**

Tab through `/dashboard` (booking cards) and `/dashboard/bookings/[id]` (visibility switch, any links) — confirm every stop has a visible focus ring and the switch is operable via keyboard (Space/Enter toggles it).

- [ ] **Step 4: Gold-contrast and landmark check**

```bash
grep -rn "text-accent\b" src/components/dashboard src/app/dashboard
```

Expected: no matches (or only `-foreground`, which is correct).

- [ ] **Step 5: Typecheck, lint, build**

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
rm -rf .next
```

Fix anything either reports before proceeding.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: verify dashboard end-to-end and accessibility"
```

## Definition of done for this plan

- `/dashboard` lists real bookings (or a proper empty state), `/dashboard/bookings/[id]` shows real traveler/payment/itinerary data.
- Live Tracking panel renders only for `ongoing` bookings, shows real seeded `TripUpdate` data, and the visibility toggle actually persists to the database.
- Ownership checks confirmed on both new routes.
- WCAG 2.1 AA checks pass.
- This completes the full page-build effort started with the public pages spec — every dead link created along the way (`/book/[slug]`, `/dashboard`, confirmation's "View my bookings") now resolves to something real.
