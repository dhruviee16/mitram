# MITRAM

Senior-assisted travel booking site (concept/investor MVP).

## Setup

Requires **pnpm** (`corepack enable` if you don't have it) and a local **Postgres** instance.

```bash
pnpm install                    # installs deps, generates the Prisma client (postinstall)
cp .env.example .env            # fill in DATABASE_URL, AUTH_SECRET, RAZORPAY_* etc.
pnpm setup                      # runs migrations + seeds the database
pnpm dev                        # start dev server on localhost:3000
```

`AUTH_SECRET` can be generated with `pnpm dlx auth secret`. Razorpay keys are only needed to exercise the checkout flow — get test-mode keys from the Razorpay dashboard.

## Scripts

```bash
pnpm dev              # dev server (Turbopack)
pnpm build            # production build
pnpm start            # run a production build
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit

pnpm db:migrate       # create + apply a migration
pnpm db:generate      # regenerate the Prisma client after schema.prisma changes
pnpm db:seed          # re-run prisma/seed.ts
pnpm db:studio        # Prisma Studio (DB GUI)
pnpm db:reset         # drop, recreate, migrate, and reseed the database
pnpm db:deploy        # apply pending migrations without prompting (production)
```

## Deploying (e.g. Vercel)

Point `DATABASE_URL` at a real hosted Postgres (Vercel Postgres, Neon, Supabase, Railway, etc.) — `pnpm setup`'s local Postgres default won't reach it. Set `AUTH_SECRET` and the `RAZORPAY_*` vars as environment variables in the host's dashboard, not in a committed `.env`.

The `vercel-build` script (`prisma migrate deploy && next build`) runs automatically instead of `build` if you deploy to Vercel — it applies migrations, it does **not** seed. The seeded data (`pnpm db:seed`) is throwaway demo content (test trips, vendors, bookings) for local development; run it against production only if you deliberately want that demo data live.

If deploying elsewhere, set the build command to `pnpm db:deploy && pnpm build` (or run `pnpm db:deploy` as a separate release step) so migrations apply before the app starts.

See `CLAUDE.md` for architecture and conventions.
