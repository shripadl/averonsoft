# PayFrame — UK take-home pay calculator

Standalone Next.js app that estimates UK take-home pay from HMRC rates. Pure client-side calculation; no backend required for the core calculator.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Vitest for the tax engine

## Quick start

```bash
cd uk-tax-calculator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test        # tax engine unit tests
npm run build   # production build
```

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | Subpath mount (e.g. `/uk-tax-calculator`) or empty for root |
| `NEXT_PUBLIC_BASE_URL` | Canonical URL for metadata |
| `NEXT_PUBLIC_SITE_NAME` | Product name |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` / `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Optional analytics |
| `STATIC_EXPORT=1` | Build as static export |

## Layout

```
uk-tax-calculator/
  app/                 Next.js routes
  components/          UI
  config/brand.config.ts
  lib/tax-engine/      Pure calculation + rates (framework-agnostic)
  lib/tax-engine/__tests__/
  DETACH.md            How to spin out to a new domain
```

## Rates

Tax years `2024-25`, `2025-26`, and `2026-27` live under `lib/tax-engine/rates/`, each citing the HMRC / GOV.UK page used. Adding a year is a new rates file plus a registry entry — no new calculation logic.

## Detaching

See [DETACH.md](./DETACH.md).
