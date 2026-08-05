# MITRAM Public Pages — Home, /trips, /trips/[slug] Design Spec

Date: 2026-08-05
Status: Approved by user, pending spec review sign-off

## 1. Purpose

Design and build the three public-facing pages that don't require auth: Home (`/`), trip listing (`/trips`), trip detail (`/trips/[slug]`). This is the first sub-project of the broader page-build effort (auth forms, booking wizard, dashboard+tracking follow as separate specs/plans). Reads the booking-site design spec (`docs/superpowers/specs/2026-08-05-mitram-booking-site-design.md`) for stack, data model, and brand baseline — this spec covers the visual/UX decisions for these 3 pages specifically.

## 2. Primary reader

Adult child / NRI buyer researching a trip on a parent's behalf — not the senior traveler directly. Research (spec §"who this is for") shows the buyer decides based on trust signals; they're the one browsing/comparing/booking. Standard modern web conventions apply (normal text sizing, hover states); senior-friendly touches (clear language, generous tap targets, high contrast) are good accessibility practice layered in, not the primary design driver.

## 3. Visual language

Confirmed via visual-companion mockups against real seeded trip data (Sammed Shikharji Yatra, etc.):

- **Palette:** maroon `#8B1A1A` primary, gold `#F5A623` accent, cream `#FFFDF5` background — from the brand spec, reused unchanged.
- **Typography:** Playfair Display headings, DM Sans body — from the brand spec.
- **Photography:** real photos (Unsplash for now, replace with MITRAM's own later), not placeholder blocks — approved explicitly by user ("we can use the images and all if we need to make the website more lively").
- **Components:** shadcn/ui (Base UI-based, `base-nova` style) as the base; supplement with 21st.dev components where they fit better than hand-rolling (e.g. `card-21` "Destination Card" by ravikatiyar162, id 7732, as a reference/base for the trip card's photo+overlay treatment). Pull actual source via the 21st MCP (`get_component`) at implementation time — the search above was metadata-only. If a specific use case doesn't have an obvious 21st match, ask the user for a reference link rather than guessing.

### Gold contrast rule (WCAG constraint, computed and confirmed)

| Pair | Ratio | Passes AA text (4.5:1)? | Passes AA non-text (3:1)? |
|---|---|---|---|
| Maroon `#8B1A1A` on cream `#FFFDF5` | 9.12:1 | Yes | Yes |
| Muted foreground `#6B6558` on cream | 5.68:1 | Yes | Yes |
| Gold `#F5A623` on cream/white | 1.99:1 | **No** | **No** |
| Dark text `#1A1A1A` on gold fill | 8.59:1 | Yes | Yes |

**Rule:** gold is a fill/background color only (badges, pills, offer callouts) with dark text on top — never used as a text or icon color directly on the cream/white background. This is a hard constraint for every component that touches gold.

## 4. Page structures

### 4.1 Home (`/`)

Top to bottom, in order (search-first, per user's reference — goal placed immediately below nav, ahead of the tagline):

1. **Nav** — logo/wordmark, primary links (Yatras / Packages / Live Tracker / About), Sign In.
2. **Search strip** — full-width maroon band directly under nav. White floating input group inside it: From, Going To, Date, Travelers, Search button. (This is a search over the curated trip catalog, not an open flight/hotel search — "Going To" autocompletes against `Trip.title`/`routeSummary`.)
3. **Hero tagline** — gradient maroon panel below the search strip: eyebrow label ("Senior-assisted travel, built with MakeMyTrip"), headline, gold offer pill.
4. **Trip carousel** — "MITRAM's Most-Loved Yatras", horizontal-scroll row of trip cards (§4.3), sourced from `tripService.listTrips()`.
5. **Trust-pillar row** — icon + label strip (Medical support, Live tracking, Verified companion, Senior-first pacing) — icons from lucide-react, not emoji, per the ui-ux-pro-max checklist.
6. **Testimonials** — 3-5 cards, photo + name + role + quote. Content: placeholder-marked clearly as such in code comments until real testimonials exist (this is the one place actual placeholder content is acceptable, since MITRAM has no real customers yet — pre-launch).
7. **CTA** — repeat of the primary "Explore trips" action.

### 4.2 Trip listing (`/trips`)

1. Nav (shared).
2. **Filter chip bar** — horizontal, wraps on narrow viewports, no sidebar column. Chips: category (`Trip.category`), region, duration buckets. Each chip is a real `<button>` with `aria-pressed`, keyboard-operable, not a styled `<div>`.
3. **Trip grid** — responsive grid of trip cards (§4.3), all trips from `tripService.listTrips()`, filtered client-side by chip state (dataset is small — 8 trips — no need for server-side filtering/pagination at this scale).

### 4.3 Trip card (shared: Home carousel + /trips grid)

Bordered card (1px border, not a drop shadow), structure top to bottom:
- Photo (real image, `object-cover`, meaningful `alt` text describing the place)
- Divider
- Title + duration badge (gold fill, dark text)
- Trust-icon row (2 icons + short labels, e.g. "Medical support", "Live tracking") — lucide icons, not emoji
- Price + text-link CTA ("View trip →") in maroon, not a filled button (quieter than the primary search/booking CTAs)

### 4.4 Trip detail (`/trips/[slug]`)

1. Nav (shared).
2. **Photo header** — trip's hero image, title, route summary, duration badge.
3. **Day-by-day itinerary** — rendered from `Trip.days` (ordered by `dayNumber`), each day: title, description, activity list. For trips with no seeded day data (`days: []`), show the trip summary and inclusions instead of an empty itinerary section — never render an empty heading with nothing under it.
4. **Booking box** — price, inclusions/care-features summary, "Book Now" CTA linking to `/book/[slug]` (booking wizard is a separate spec/plan — this button can be a stub until that exists).
   - **Desktop (≥768px):** sticky sidebar alongside the itinerary, stays in view while scrolling.
   - **Mobile (<768px):** collapses to a bar pinned to the bottom of the viewport, always visible, doesn't obscure content (page content gets bottom padding equal to the bar's height).

## 5. Accessibility (WCAG 2.1 AA baseline)

- Gold contrast rule from §3 enforced everywhere gold appears.
- Semantic landmarks: `<nav>`, `<main>`, `<footer>` on every page; one `<h1>` per page.
- Skip-to-content link, visually hidden until focused, as the first focusable element.
- Visible focus rings on every interactive element — never `outline: none` without a replacement indicator.
- All images have real, descriptive `alt` text (the place/subject, not the filename); decorative images use `alt=""`.
- Filter chips and carousel controls are real buttons, keyboard-operable, with `aria-pressed`/`aria-label` as appropriate.
- No motion-only affordances; any hover/tilt animation (e.g. from a 21st.dev component) respects `prefers-reduced-motion` — reduce to a simple opacity/border change instead of transform when the user has that preference set.
- Icons are lucide-react (or equivalent SVG set), never emoji-as-icon, per the existing pre-delivery checklist from the ui-ux-pro-max skill.

## 6. Out of scope for this spec

- Auth pages (`/login`, `/signup`) — separate spec.
- Booking wizard (`/book/[tripSlug]`) — separate spec. Trip detail's "Book Now" links there but the destination doesn't need to exist yet (can 404 or redirect to a stub during this build).
- Dashboard + live tracking UI — separate spec.
- Real MITRAM photography (using Unsplash placeholders now, swappable later).
- Real testimonial content (pre-launch — no real customers yet).
