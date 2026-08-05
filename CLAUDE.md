# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working here.

@AGENTS.md

## What this is

MITRAM — senior-assisted travel booking site (concept/investor MVP, not production). Full spec + rationale: `docs/superpowers/specs/2026-08-05-mitram-booking-site-design.md`. Setup plan: `docs/superpowers/plans/2026-08-05-project-setup.md`. Read spec before adding features — documents product decisions (dual-buyer booking flow, live-tracking visibility default, brand palette) so no re-litigate per change.

## Commands

Package manager **pnpm** — no `npm`/`npx` for project deps; use `pnpm dlx` instead of `npx` for one-off CLI runs (shadcn, prisma).

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

Local Postgres, default creds, DB `mitram` (`postgresql://postgres:postgres@localhost:5432/mitram`). No Docker.

## Architecture

**MVC layering inside Next.js App Router** — load-bearing convention, don't collapse:

- **Models**: `prisma/schema.prisma` (schema source of truth).
- **Services** (business logic + all Prisma queries): `src/server/services/*.ts` — e.g. `tripService`, `bookingService`, `authService`. Route handlers + server components call these; never touch `prisma` directly.
- **Controllers**: `src/app/api/**/route.ts` — thin. Parse/validate request, call service, shape response. No queries or business rules here.
- **Views**: `src/app/**/page.tsx` (server components) + `src/components/**` (shadcn UI, client components for interactive bits).

### Prisma 7 specifics (new driver-adapter model, not `prisma-client-js`)

- Generator `prisma-client`, output `src/generated/prisma` (gitignored, regenerate with `pnpm dlx prisma generate` after schema changes — check after migrating, not always auto-triggered).
- `PrismaClient` needs explicit driver adapter — see `src/server/db.ts`. No bare `new PrismaClient()` with just connection string anymore; it's `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`.
- Datasource URL read via `prisma.config.ts` (uses `dotenv/config`), not inline `env("DATABASE_URL")` in schema.
- `prisma/seed.ts` builds own `PrismaClient` (with adapter) instead of importing `src/server/db.ts` singleton, since runs outside Next.js process via `tsx`.

### Auth (Auth.js v5 / next-auth beta)

Split into two files on purpose:

- `src/auth.config.ts` — edge-safe config (session/pages/jwt callbacks, no providers). Used by `src/proxy.ts`.
- `src/auth.ts` — full config, adds Credentials provider (pulls in Prisma + bcrypt, both Node-only). Used everywhere else (API routes, server components).

Don't import `src/auth.ts` from `src/proxy.ts` — bcrypt/Prisma break edge bundle. If proxy-level logic needs more than session presence, extend `auth.config.ts`'s callbacks, not by swapping in full config.

`authService.verifyCredentials` normalizes email casing, always runs bcrypt comparison (against dummy hash when no user exists) to avoid timing side-channel that'd let caller enumerate registered emails. Keep both behaviors if touching that function.

### Routing/middleware naming

Next.js 16 renamed middleware convention to `proxy.ts` (`src/proxy.ts` here, default export, same `matcher` config shape as old `middleware.ts`). Don't recreate `middleware.ts`.

### Theming

Brand palette lives in `src/app/globals.css` (`:root`/`.dark` CSS variables — maroon `#8B1A1A` primary, gold `#F5A623` accent, cream `#FFFDF5` background), consumed via shadcn semantic classes (`bg-primary`, `text-primary-foreground`, etc.) — never hardcode hex/Tailwind palette colors in components. Headings use `font-heading` (Playfair Display), body defaults `font-body` (DM Sans), both loaded via `next/font/google` in `src/app/layout.tsx`.

shadcn configured with `style: "base-nova"`, built on **Base UI** (`@base-ui/react`), not Radix — component internals differ from most shadcn examples/tutorials online (e.g. no `@radix-ui/react-slot`; `Button`/`Dialog` wrap `@base-ui/react` primitives instead). Keep in mind adding/hand-writing components — `src/components/ui/form.tsx` hand-written for this reason (CLI's `add form` didn't complete cleanly against this style).

Toasts: `sonner` (`src/components/ui/sonner.tsx`) + `<Toaster />` mounted once in `src/app/layout.tsx`, wrapped by `next-themes`'s `ThemeProvider` (`src/components/providers/theme-provider.tsx`), needed for theme-aware styling. Trigger with `toast.success(...)` etc. from `sonner` — no extra setup per component.

### Data model

Full model list + relationships: `prisma/schema.prisma`. Notable: `Booking.bookedFor` (`self`/`parent`/`nri`) and `Booking.trackingVisible` encode product's dual-buyer + live-tracking-default decisions from spec — don't change default behavior without checking spec's rationale first. `TripUpdate` rows are (currently seed-only, simulated) data behind live-tracking feature.