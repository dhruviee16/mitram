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
```

See `CLAUDE.md` for architecture and conventions.
