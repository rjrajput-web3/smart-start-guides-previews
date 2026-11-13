# Marketplace Starter

A complete, fully-typed starter for a digital marketplace (freelance-services
marketplace) — ready to run locally and extend into a production product.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · NextAuth
(Auth.js v4) · Prisma · Zustand · bcryptjs · Zod · lucide-react

## What is included

| Area | Implementation |
|---|---|
| Pages | Home (search + category filter + listing grid), listing detail (`/listings/[slug]`), dashboard (`/dashboard`), sign-in (`/auth/signin`) |
| Auth | NextAuth with email/password (Credentials, bcrypt-hashed, Zod-validated) + Google and GitHub OAuth providers that auto-enable when their env vars are set. JWT sessions, custom sign-in page, role carried on the session. |
| Database | Prisma schema: `User` (roles BUYER / SELLER / ADMIN), `Category`, `Listing`, `Order`, `Review`, plus NextAuth `Account` / `Session` / `VerificationToken`. Relations, indexes and a one-review-per-order rule included. `prisma/seed.ts` creates demo users, listings, an order and a review. |
| State | Zustand store (`src/lib/store.ts`): category filter, search query, saved listings (persisted to localStorage), recently viewed. |
| UI | Header (with saved-count badge + session-aware sign-in/out), footer, listing card, listing detail with reviews + seller card, search bar, category filter, dashboard with order table and saved services. Real copy throughout — no lorem ipsum. |
| Config | `tsconfig.json` (strict), `tailwind.config.ts`, `postcss.config.mjs`, `next.config.mjs`, `.eslintrc.json`, `package.json` with every dependency declared. |

## Quick start (local)

Requirements: **Node.js ≥ 18.17** and npm ≥ 9.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum set NEXTAUTH_SECRET (openssl rand -base64 32).
# The default DATABASE_URL is a local SQLite file, so no database server
# is needed for development.

# 3. Create the database and seed demo data
npx prisma db push
npm run db:seed

# 4. Run the dev server
npm run dev
# Open http://localhost:3000
```

Demo login (after seeding): **buyer@example.com / DemoPass123**

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Generate the Prisma client, then production-build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint (Next.js config) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:seed` | Seed demo users / listings / order / review |
| `npm run db:studio` | Open Prisma Studio to browse the data |

## Environment variables

Every variable is documented in `.env.example` — copy it to `.env` and read
the comments there. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `NEXTAUTH_URL` | Yes | Public app URL (callback URLs). `http://localhost:3000` locally. |
| `NEXTAUTH_SECRET` | Yes (prod) | Signs NextAuth JWTs. Generate with `openssl rand -base64 32`. |
| `DATABASE_URL` | Yes | Prisma connection string. Default: local SQLite `file:./dev.db`. For production use PostgreSQL and change the Prisma `provider` to `postgresql`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Enable Google sign-in (free, Google Cloud Console → APIs & Services → Credentials). |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | No | Enable GitHub sign-in (free, GitHub Settings → Developer settings → OAuth Apps). |
| `EMAIL_SERVER` / `EMAIL_FROM` | No | SMTP for email flows. App runs fine without it. |

Never commit `.env` — it is gitignored. `.env.example` is safe to commit.

## How the pieces fit

```
src/app/            App Router pages + API routes
  api/auth/[...nextauth]/route.ts   NextAuth handler
  listings/[id]/page.tsx           Listing detail (server component)
  dashboard/page.tsx               Orders + saved services (client)
  auth/signin/page.tsx             Sign-in form + OAuth buttons
src/lib/
  auth.ts           NextAuth options, credentials authorize, hashPassword
  prisma.ts         Singleton PrismaClient (dev hot-reload safe)
  data.ts           Sample catalogue (same shape as the Prisma models)
  store.ts          Zustand marketplace store (filter/search/saved)
src/components/     Header, Footer, ListingCard, ListingGrid, SearchBar,
                    CategoryFilter, SaveButton, Providers (SessionProvider)
prisma/
  schema.prisma     All models + relations
  seed.ts           Demo data
```

**From sample data to the real database:** the home page and listing pages
currently read `src/lib/data.ts` so the UI works with zero setup. To go live,
replace the `getListings` / `getListingBySlug` calls with Prisma queries
(`prisma.listing.findMany({ include: { seller: true, category: true } })`)
— the field shapes already match. The dashboard order table is labelled in
code where the equivalent `prisma.order.findMany({ where: { buyerId } })`
query belongs.

**Payments:** the order button is intentionally a sign-in step, not a charge.
Wire Stripe Checkout (or your payment provider) at the order step; the
`Order` model already stores `amountCents` as a snapshot of the listing
price at purchase time.

## Deployment

### Vercel (recommended for Next.js)

1. Push this repo to GitHub.
2. Import it in Vercel → set the environment variables from `.env.example`
   (`NEXTAUTH_URL` = your Vercel domain, `NEXTAUTH_SECRET` = a fresh random
   secret, `DATABASE_URL` = your hosted database URL).
3. For the database, use a hosted PostgreSQL (e.g. Neon, Supabase, Railway —
   all have free tiers): set `DATABASE_URL` to its connection string and
   change `provider` in `prisma/schema.prisma` from `sqlite` to
   `postgresql`, then run `npx prisma db push` against it once.
4. Deploy. No build settings need changing — `npm run build` already runs
   `prisma generate` first.

### Any Node host / Docker

```bash
npm ci
npx prisma db push
npm run build
npm start   # serves on port 3000; set PORT to change it
```

Set the same environment variables on the host. The app needs only Node.js
and a reachable database — no other services.

## Project structure

```
.
├── prisma/                 Schema + seed
├── src/
│   ├── app/                Pages, layout, globals.css, API routes
│   ├── components/         Header, Footer, ListingCard, …
│   ├── lib/                auth, prisma, data, store
│   └── types/              Shared types + NextAuth session augmentation
├── .env.example            Documented env-var schema
├── next.config.mjs  tailwind.config.ts  tsconfig.json  .eslintrc.json
└── package.json
```

## License

MIT — see `LICENSE` if added, otherwise use freely: you may use, modify and
distribute this starter for commercial or non-commercial projects, with no
attribution required.
