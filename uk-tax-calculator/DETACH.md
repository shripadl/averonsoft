## Hosting under Averonsoft

When nested in the Averonsoft monorepo, the calculator is also mounted at
`/uk-tax-calculator` on the main site (same deploy). The standalone app in
this folder remains independently deployable — see steps below.


## 1. Update branding

Edit `config/brand.config.ts` (or set the matching `NEXT_PUBLIC_*` env vars):

- `NEXT_PUBLIC_SITE_NAME` / `NEXT_PUBLIC_LOGO_TEXT`
- `NEXT_PUBLIC_DOMAIN` / `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- Clear `NEXT_PUBLIC_PARENT_CREDIT` and `NEXT_PUBLIC_PARENT_URL` if you no longer want a parent-site credit

## 2. Point DNS

Create a CNAME (or A/AAAA) for your new domain to your host (e.g. Vercel). Attach the domain in the hosting dashboard.

## 3. Analytics

Set either:

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your.domain`
- or `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXX`

Leave both empty to run with analytics off.

## 4. Routing mode

- **Root domain** (e.g. `https://listentopay.co.uk`): leave `NEXT_PUBLIC_BASE_PATH` empty.
- **Subpath** (e.g. `averonsoft.com/uk-tax-calculator`): set `NEXT_PUBLIC_BASE_PATH=/uk-tax-calculator`.

## 5. Redeploy

From this folder:

```bash
npm install
npm test
npm run build
```

Deploy the `uk-tax-calculator` project on its own — it has no shared database, auth, or runtime dependency on the parent Averonsoft app.
