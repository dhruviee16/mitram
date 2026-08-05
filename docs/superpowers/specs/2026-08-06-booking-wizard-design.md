# MITRAM Booking Wizard — /book/[tripSlug] Design Spec

Date: 2026-08-06
Status: Approved by user, pending spec review sign-off

## 1. Purpose

Build `/book/[tripSlug]` — the third sub-project of the page-build effort, after public pages and auth. This is the core differentiator from the PRD: the dual-buyer booking flow (an adult child or NRI books/pays on behalf of a senior parent), ending in a real Razorpay test-mode payment. Reads the booking-site design spec (`docs/superpowers/specs/2026-08-05-mitram-booking-site-design.md`) for the data model (`Booking`, `TravelerProfile`, `Payment`) and the dual-buyer rationale — this spec covers the wizard UI and payment integration built on top of it.

## 2. Scope

**In scope:** the 5-step wizard (who's this for → traveler details → room/care → review → payment), `POST /api/bookings`, `POST /api/payments/create-order`, `POST /api/payments/verify`, `POST /api/webhooks/razorpay`, a standalone `/book/confirmation/[bookingId]` page.

**Added mid-build:** `POST /api/webhooks/razorpay` — the client-driven `verify` call alone can't catch a successful charge where the browser tab closed, the network dropped, or the JS crashed right after Razorpay's popup succeeded but before `verify` was called. The webhook is Razorpay's server-to-server `payment.captured` notification, authenticated by a *separate* signature scheme (HMAC-SHA256 over the raw request body using a webhook secret, `RAZORPAY_WEBHOOK_SECRET`, configured in the Razorpay dashboard — not the checkout `order_id|payment_id` signature `verify` uses). Both paths call idempotent update logic, so whichever arrives first wins and the other is a safe no-op.

**Explicitly out of scope:**
- Reusing an existing `TravelerProfile` — every booking creates a new one, per user decision. A "select from saved travelers" picker is a natural future enhancement once there's real repeat-booking data.
- Dashboard / "My Bookings" list — separate future spec. The confirmation page is intentionally self-contained so it isn't throwaway work once that spec lands.
- Real Razorpay keys — the user is obtaining test API keys separately; the integration is built to the official pattern regardless and simply won't complete a live checkout until `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are populated in `.env`.

## 3. Access control

`/book/*` is already covered by the existing `src/proxy.ts` matcher (redirects unauthenticated visitors to `/login?callbackUrl=...`), so no new auth wiring is needed here — this spec builds entirely inside that existing guarantee.

## 4. Wizard steps (single page, client-side state)

Matches the booking-site spec's requirement for a visible step indicator ("Step 2 of 4" pattern) — implemented as 4 input steps + a 5th confirmation state, all within one client component holding the in-progress booking as local state (no partial data persisted server-side until the final "Pay" action).

1. **Who's this for?** — radio: Myself / My parent / NRI booking from abroad → `Booking.bookedFor` (`self`/`parent`/`nri`).
2. **Traveler details** — name, age, relationship (auto-filled from step 1's choice but editable), health notes (free-text tags), dietary needs (free-text tags, with a Jain Satvik quick-select given it's the most common real case in the seeded trips) → becomes a new `TravelerProfile`.
3. **Room & care** — room type (single / twin / triple, radio), special care requests (checkboxes: BP/sugar monitoring, wheelchair assist, dedicated companion, dietary accommodation; plus free-text notes) → `Booking.roomType` + `Booking.specialCareRequests`.
4. **Review** — trip summary (photo, title, dates-equivalent duration), traveler summary, room/care summary, total price (`Trip.basePrice × 1` — single traveler per booking for this MVP, matching the spec's `numTravelers` field defaulting to 1), "Pay ₹X" button.
5. **Payment** — clicking "Pay" triggers the booking-creation + Razorpay order-creation + Checkout flow described in §5. Not a separate visual step in the indicator (it's the terminal action of step 4), but tracked as its own loading/error state.

Each step has Back/Next navigation; Next is disabled until that step's required fields are valid (zod-validated, same pattern as the auth forms).

## 5. Payment integration (official Razorpay pattern)

1. On "Pay", the client first calls `POST /api/bookings` with the accumulated wizard state. The route validates with zod, creates the `TravelerProfile` and the `Booking` (status `pending`, `totalAmount` = trip's `basePrice`), and returns the new `bookingId`.
2. The client calls `POST /api/payments/create-order` with `bookingId`. The route uses the official `razorpay` npm package to create a Razorpay Order (`razorpay.orders.create({ amount: totalAmount * 100, currency: "INR", receipt: bookingId })` — amount in paise, per Razorpay's API), creates the `Payment` row (status `created`, stores `razorpayOrderId`), and returns the order ID plus the public `key_id` (never the secret) to the client.
3. The client loads Razorpay's Checkout.js and opens it with that order ID. On successful test payment, Razorpay's callback hands the client `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`.
4. The client posts those three values to `POST /api/payments/verify`. The route recomputes the HMAC-SHA256 signature server-side using `key_secret` (`crypto.createHmac("sha256", keySecret).update(order_id + "|" + payment_id).digest("hex")`) and compares — **never trusts the client's claim of success**. On match, it updates `Payment` → `paid` with the real `razorpayPaymentId`, and `Booking` → `confirmed`.
5. The client redirects to `/book/confirmation/[bookingId]`.

If step 2 or 4 fails (network error, signature mismatch), the booking stays `pending`/the payment stays `created` — no silent success. The wizard surfaces a `sonner` error toast and lets the user retry from the review step without re-entering traveler details (kept in the still-mounted client state).

## 6. Confirmation page

`/book/confirmation/[bookingId]` — server component. Fetches the booking via `bookingService.getBookingById`, checks it belongs to the logged-in session's user (403/`notFound()` otherwise — this is a real access-control point, not optional), and renders: trip photo/title, traveler name, room type, amount paid, a "View my bookings" link (to `/dashboard` — currently unbuilt, same accepted-dead-link precedent as the trip detail page's original "Book Now" button before this wizard existed).

## 7. Accessibility

Same WCAG 2.1 AA baseline as prior specs: real labels via the existing `Form` primitives, inline validation, visible focus rings, gold-contrast rule, one `<h1>` per page (the wizard's current step title). The step indicator itself must be announced to screen readers (e.g. `aria-current="step"` on the active step, or a visually-hidden "Step 2 of 4" string) — not conveyed by color/position alone.

## 8. Out of scope for this spec

- Traveler-profile reuse picker.
- Dashboard / booking list / live tracking view.
- Multi-traveler bookings (this wizard books exactly one `TravelerProfile` per `Booking`, matching `numTravelers: 1`; group bookings are a future enhancement).
- Refunds/cancellations.
