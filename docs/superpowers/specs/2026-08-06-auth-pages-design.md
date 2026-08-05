# MITRAM Auth Pages — /login, /signup Design Spec

Date: 2026-08-06
Status: Approved by user, pending spec review sign-off

## 1. Purpose

Build `/login` and `/signup` — the second sub-project of the page-build effort, after public pages. These unblock the booking wizard and dashboard, both of which require an authenticated session. Reads the booking-site design spec (`docs/superpowers/specs/2026-08-05-mitram-booking-site-design.md`) for the auth architecture already wired in setup (`src/auth.ts`, `src/auth.config.ts`, `authService.verifyCredentials`/`registerUser`) — this spec covers only the two pages that call into that existing layer.

## 2. Scope

**In scope:** `/login`, `/signup` pages; client-side `signIn("credentials", ...)` wiring; a new `POST /api/auth/register` route calling the existing `authService.registerUser`; redirect-after-auth honoring the `callbackUrl` query param the proxy already sets when bouncing unauthenticated users off `/dashboard` or `/book`.

**Explicitly out of scope:**
- "Forgot password" — no email-sending infrastructure exists yet; omit the link entirely rather than show a dead end.
- Social/OAuth login (Google, etc.) — the booking-site spec already locked email/password only for this MVP.
- Phone/OTP login — same reason.

## 3. Layout

Base: shadcn's `login-04` / `signup-04` registry blocks (`pnpm dlx shadcn@latest add login-04 signup-04`) — split two-column layout, form on one side, a real trip photo on the other. These blocks use shadcn's semantic theme tokens (`bg-primary`, `bg-card`, etc.), so they inherit the MITRAM maroon/gold/cream palette and Playfair/DM Sans typography automatically, same as every other page — no manual re-theming needed beyond checking the fetched block code doesn't hardcode any raw colors (fix inline if it does).

Image side: reuse a real photo already in `public/images/trips/` (e.g. `sammed-shikharji-yatra.jpg` or one of the `dwarka-rann-of-kutch-*.jpg` set) — no new stock imagery, matching the "real photos only" precedent from the public-pages build.

## 4. `/login`

- Fields: email, password. Built with the existing `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` components (`src/components/ui/form.tsx`) + `react-hook-form` + `zod`, all already installed.
- Zod schema: `email` (valid email format), `password` (non-empty — the actual strength check already happened at signup; login just needs *a* password to attempt).
- Submit handler (client component): calls NextAuth's `signIn("credentials", { email, password, redirect: false })`. On success, `router.push(callbackUrl ?? "/")` where `callbackUrl` is read from `useSearchParams()`. On failure (`result?.error`), `toast.error("Incorrect email or password.")` via the already-configured `sonner` — no separate error page, no leaking *which* field was wrong (avoids the same enumeration concern `authService` already guards against server-side).
- Inline validation: on blur, per the existing accessibility conventions from the public-pages spec.
- A "New here? Create an account" link to `/signup`, preserving `callbackUrl` in the link's query string if present.

## 5. `/signup`

- Fields: name, email, password.
- Zod schema: `name` (non-empty), `email` (valid format), `password` (minimum 8 characters — the one piece of real validation logic here, since this is the point new credentials are actually created; login doesn't re-check this).
- Submit handler: `POST /api/auth/register` with `{ name, email, password }`. That route is a thin controller — parses/validates with the same zod schema server-side, calls `authService.registerUser(email, password, name)`, and:
  - on success, the client immediately calls `signIn("credentials", { email, password, redirect: false })` after the fetch resolves — the route itself only creates the user; the client then signs them in so the session cookie is set through NextAuth's normal flow. Redirects the same way as login afterward.
  - on failure (duplicate email, from `registerUser`'s existing `throw new Error(...)`), the route returns a 409 with the error message; the client shows it via `toast.error(...)`.
- A "Already have an account? Sign in" link to `/login`, preserving `callbackUrl`.

## 6. Redirect behavior (shared)

Both pages read `callbackUrl` via `useSearchParams()` (wrapped in `Suspense`, per the same Next.js requirement already handled in the `/trips` listing page). Default redirect target if absent: `/`. This exactly mirrors what `src/proxy.ts` already sets when it bounces an unauthenticated user off a protected route.

## 7. Accessibility

Same WCAG 2.1 AA baseline as the public-pages spec: real `<label>`s (via `FormLabel`, already accessible by construction), inline validation errors announced via `FormMessage`, visible focus rings (inherited from shadcn `Input`/`Button`), one `<h1>` per page, and the gold-contrast rule (`#F5A623` never as text/icon color on light backgrounds) enforced if the fetched blocks use gold anywhere — check and fix inline if so.

## 8. Out of scope for this spec

- Password reset flow (needs email infra — separate future spec).
- OAuth/social providers.
- Rate limiting / brute-force protection on login (worth flagging for a future security pass, not blocking this MVP page-build).
