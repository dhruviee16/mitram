# MITRAM Dashboard — /dashboard, /dashboard/bookings/[id] Design Spec

Date: 2026-08-06
Status: Approved by user, pending spec review sign-off

## 1. Purpose

Build `/dashboard` and `/dashboard/bookings/[id]` — the fourth and final sub-project of the page-build effort, completing the loop the earlier pages left open: the confirmation page's "View my bookings" link, and the trip detail page's live-tracking promise from the original booking-site spec (§6a). Reads `docs/superpowers/specs/2026-08-05-mitram-booking-site-design.md` for the `Booking`/`TripUpdate` data model and the visibility-vs-dignity default already decided there (`trackingVisible` defaults to `true`, opt-out).

## 2. Scope

**In scope:** `/dashboard` (bookings list), `/dashboard/bookings/[id]` (detail + live tracking), `PATCH /api/bookings/[id]/tracking-visibility`.

**Explicitly out of scope:**
- Real interactive map (Google Maps/Mapbox) — stylized/illustrative visualization instead, per user decision. No new API key/billing dependency.
- Multi-user sharing/invites (a second family member's own account viewing this booking) — the dashboard is single-owner; `trackingVisible` is a display toggle the booking's owner controls, not an access-control system for other accounts.
- Editing/cancelling a booking, refunds.
- Admin-side booking status transitions (`pending → confirmed → upcoming → ongoing → completed`) — bookings show whatever status is already in the database; this spec doesn't add a mechanism to advance it (that's admin-panel territory, out of scope per the original booking-site spec).

## 3. Access control

`/dashboard` is already covered by the existing `src/proxy.ts` matcher. The detail page and the tracking-visibility route each independently re-check ownership (`booking.userId === session.user.id`) — same defense-in-depth pattern used throughout the booking wizard and confirmation page, not a new pattern.

## 4. `/dashboard` — bookings list

Server component. Fetches via `bookingService.listBookingsForUser(session.user.id)` (already exists from setup). Renders a card per booking:
- Trip photo (first image, Unsplash fallback — same pattern as `TripCard`)
- Trip title, route summary
- Status badge (color varies by status: `confirmed`/`ongoing` in primary, `completed` in muted, `cancelled` in destructive)
- Room type, total amount
- Links to `/dashboard/bookings/[id]`

**Empty state:** if the user has no bookings, show a message ("You haven't booked a trip yet") with a CTA linking to `/trips` — not a bare blank page.

## 5. `/dashboard/bookings/[id]` — booking detail

Server component, ownership-checked (`notFound()` on mismatch, same as the confirmation page). Fetches via `bookingService.getBookingById` (already includes `trip`, `travelers`, `payment`, `tripUpdates` — no service changes needed). Renders:
- Trip summary (photo, title, route, duration)
- Traveler info (name, age, relationship, health/dietary notes)
- Room & care requests
- Payment status (amount, `paid`/`created` badge)
- Itinerary recap (reuse the day-by-day rendering approach from the trip detail page's `ItinerarySection`, read-only)

### Live Tracking panel (only when `booking.status === "ongoing"`)

- **Stylized map card**: a styled card (gradient background evoking a map, matching the brand palette) with a pin marker + CSS pulse animation, showing the most recent `TripUpdate`'s `locationLabel` and relative timestamp ("Updated 3 hours ago"). No real map SDK — this is the illustrative treatment from the original Saathi dashboard mockup, not a live embed. Real `lat`/`lng` fields already exist on `TripUpdate` for a future real-map upgrade.
- **Timeline**: chronological list of every `TripUpdate` for this booking (location, note, health snapshot — BP/sugar/temp/status when present), oldest to newest, visually consistent with the itinerary day-by-day list's left-border timeline style already established on the trip detail page.
- **Visibility toggle**: a shadcn `Switch` bound to `booking.trackingVisible`, calling `PATCH /api/bookings/[id]/tracking-visibility` on change. Label copy makes the default explicit and names the tradeoff (e.g. "Visible to you by default — turn off to keep this trip more private"), matching the original spec's requirement that the visibility default be visible in the UI, not just in code.

If `status !== "ongoing"`, the panel doesn't render at all (no empty/disabled placeholder) — tracking is only meaningful for a trip actually in progress.

## 6. `PATCH /api/bookings/[id]/tracking-visibility`

Thin controller: `auth()` check, ownership check (booking belongs to session user), zod-validates `{ visible: boolean }`, updates `Booking.trackingVisible`, returns the updated value. No new service file needed — small enough to add as a `setTrackingVisibility` function in the existing `bookingService.ts`.

## 7. Accessibility

Same WCAG 2.1 AA baseline as every prior spec: gold-contrast rule, real alt text, one `<h1>` per page, visible focus rings. The `Switch` toggle needs an accessible label (not just visual position) — shadcn's `Switch` + a `Label` pairing handles this, not a bare `role="switch"` div. The pulse animation on the map pin respects `prefers-reduced-motion` (reduces to a static pin, no animation) — same convention already applied to the trip-card hover and gallery transitions.

## 8. Out of scope for this spec

- Real map integration.
- Cross-account sharing/invites.
- Booking edit/cancel/refund flows.
- Automatic booking-status progression.
