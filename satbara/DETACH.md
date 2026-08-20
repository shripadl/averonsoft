## Hosting under Averonsoft

When nested in the Averonsoft monorepo, Satbara is also mounted at
`/satbara` on the main site (same deploy). The standalone app in this folder
remains independently deployable — see steps below.

Subdomain (same Vercel project): point a CNAME such as `satbara.averonsoft.com`
at your Averonsoft deployment. The parent `proxy.ts` rewrites that host to
`/satbara` (override with `SATBARA_HOST`). Site chrome is hidden via CSS
when `.satbara-root` is present.


## 1. Update branding

Edit `config/brand.config.ts` (or set the matching `NEXT_PUBLIC_*` env vars):

- `NEXT_PUBLIC_SITE_NAME` / `NEXT_PUBLIC_LOGO_TEXT`
- `NEXT_PUBLIC_DOMAIN` / `NEXT_PUBLIC_BASE_URL` (e.g. `https://satbara.averonsoft.com`)
- `NEXT_PUBLIC_CONTACT_EMAIL`
- Optional: `NEXT_PUBLIC_OFFICIAL_PORTAL_URL` (default MahaBhulekh)
- Clear `NEXT_PUBLIC_PARENT_CREDIT` and `NEXT_PUBLIC_PARENT_URL` if you no longer want a parent-site credit

## 2. Point DNS

Create a CNAME (or A/AAAA) for your subdomain to your host (e.g. Vercel).
Attach the domain in the hosting dashboard.

- **Same project as Averonsoft:** set `SATBARA_HOST=satbara.averonsoft.com` (or your CNAME) on the parent app.
- **Separate project:** deploy this folder alone and leave `NEXT_PUBLIC_BASE_PATH` empty.

## 3. Analytics

Set either:

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your.domain`
- or `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXX`

Leave both empty to run with analytics off.

## 4. Routing mode

- **Root / CNAME** (e.g. `https://satbara.averonsoft.com`): leave `NEXT_PUBLIC_BASE_PATH` empty.
- **Subpath** (e.g. `averonsoft.com/satbara`): set `NEXT_PUBLIC_BASE_PATH=/satbara`.

## 5. Redeploy

From this folder:

```bash
npm install
npm run build
```

This app has no shared database, auth, or runtime dependency on the parent
Averonsoft app. Search runs client-side against the bundled Maharashtra
hierarchy + illustrative 7/12 index. Certified extracts remain on the
official MahaBhulekh portal.
