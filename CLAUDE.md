# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

MITRAM — a senior-assisted travel booking website (concept/investor MVP, not production). Full spec and rationale live in `docs/superpowers/specs/2026-08-05-mitram-booking-site-design.md`; the setup implementation plan is in `docs/superpowers/plans/2026-08-05-project-setup.md`. Read the spec before adding features — it documents the product decisions (dual-buyer booking flow, live-tracking visibility default, brand palette) so they don't get re-litigated per change.

## Commands

Package manager is **pnpm** — do not use `npm`/`npx` for project deps; use `pnpm dlx` in place of `npx` for one-off CLI runs (shadcn, prisma).

```bash
pnpm dev              # start dev server (Turbopack, localhost:3000)
pnpm build             # production build
pnpm lint              # eslint

pnpm dlx prisma migrate dev --name <name>   # create + apply a migration
pnpm dlx prisma generate                     # regenerate client after schema.prisma changes
pnpm dlx prisma db seed                      # re-run prisma/seed.ts
pnpm dlx prisma studio                       # DB GUI

pnpm dlx shadcn@latest add @shadcn/<name>    # add a shadcn component (use the shadcn MCP's
                                              # get_add_command_for_items to resolve the right
                                              # registry name first — some items don't fully
                                              # install via the bare `add <name>` form, e.g. `form`)
```

Local Postgres, default creds, database `mitram` (`postgresql://postgres:postgres@localhost:5432/mitram`). No Docker.

## Architecture

**MVC layering inside the Next.js App Router** — this is the load-bearing convention, don't collapse it:
- **Models**: `prisma/schema.prisma` (schema source of truth).
- **Services** (business logic + all Prisma queries): `src/server/services/*.ts` — e.g. `tripService`, `bookingService`, `authService`. Route handlers and server components call these; they never touch `prisma` directly.
- **Controllers**: `src/app/api/**/route.ts` — thin. Parse/validate the request, call a service, shape the response. No queries or business rules here.
- **Views**: `src/app/**/page.tsx` (server components) + `src/components/**` (shadcn-based UI, client components for interactive bits).

### Prisma 7 specifics (this project uses the new driver-adapter model, not `prisma-client-js`)

- Generator is `prisma-client`, output `src/generated/prisma` (gitignored, regenerate with `pnpm dlx prisma generate` after schema changes — check after migrating, it isn't always auto-triggered).
- `PrismaClient` requires an explicit driver adapter — see `src/server/db.ts`. There is no bare `new PrismaClient()` with just a connection string anymore; it's `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`.
- Datasource URL is read via `prisma.config.ts` (uses `dotenv/config`), not inline `env("DATABASE_URL")` in the schema.
- `prisma/seed.ts` constructs its own `PrismaClient` (with adapter) rather than importing the `src/server/db.ts` singleton, since it runs outside the Next.js process via `tsx`.

### Auth (Auth.js v5 / next-auth beta)

Split into two files on purpose:
- `src/auth.config.ts` — edge-safe config (session/pages/jwt callbacks, no providers). Used by `src/proxy.ts`.
- `src/auth.ts` — full config, adds the Credentials provider (which pulls in Prisma + bcrypt, both Node-only). Used everywhere else (API routes, server components).

Don't import `src/auth.ts` from `src/proxy.ts` — bcrypt/Prisma break the edge bundle. If proxy-level logic needs more than session presence, extend `auth.config.ts`'s callbacks, not by swapping in the full config.

`authService.verifyCredentials` normalizes email casing and always runs a bcrypt comparison (against a dummy hash when no user exists) to avoid a timing side-channel that would let a caller enumerate registered emails. Keep both behaviors if you touch that function.

### Routing/middleware naming

Next.js 16 renamed the middleware convention to `proxy.ts` (`src/proxy.ts` here, default export, same `matcher` config shape as old `middleware.ts`). Don't recreate `middleware.ts`.

### Theming

Brand palette lives in `src/app/globals.css` (`:root`/`.dark` CSS variables — maroon `#8B1A1A` primary, gold `#F5A623` accent, cream `#FFFDF5` background) and is consumed via shadcn's semantic classes (`bg-primary`, `text-primary-foreground`, etc.) — never hardcode hex/Tailwind palette colors in components. Headings use `font-heading` (Playfair Display), body defaults to `font-body` (DM Sans), both loaded via `next/font/google` in `src/app/layout.tsx`.

shadcn is configured with `style: "base-nova"`, which is built on **Base UI** (`@base-ui/react`), not Radix — component internals differ from most shadcn examples/tutorials found online (e.g. no `@radix-ui/react-slot`; `Button`/`Dialog` wrap `@base-ui/react` primitives instead). Keep this in mind when adding or hand-writing components — `src/components/ui/form.tsx` was hand-written for this reason (the CLI's `add form` didn't complete cleanly against this style).

Toasts: `sonner` (`src/components/ui/sonner.tsx`) + `<Toaster />` mounted once in `src/app/layout.tsx`, wrapped by `next-themes`'s `ThemeProvider` (`src/components/providers/theme-provider.tsx`), which the toaster needs for theme-aware styling. Trigger with `toast.success(...)` etc. from `sonner` — no additional setup needed per component.

### Data model

Full model list and relationships: `prisma/schema.prisma`. Notable: `Booking.bookedFor` (`self`/`parent`/`nri`) and `Booking.trackingVisible` encode the product's dual-buyer and live-tracking-default decisions from the spec — don't change their default behavior without checking the spec's rationale first. `TripUpdate` rows are the (currently seed-only, simulated) data behind the live-tracking feature.
