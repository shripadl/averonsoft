# PhotoSpec

UK passport photo formatter. Crop a portrait to GOV.UK digital size
(600×750 px), optionally replace the background, and download a JPEG —
all in the browser.

This is a formatting aid, not an HM Passport Office service.

## Features

- Face detection and chin-to-crown crop against published 29–34 mm guidance
- Optional on-device background replacement (plain cream / light grey)
- Measurable checks: one face, pixel size, JPEG size, head height
- Digital JPEG plus a 6-up print sheet
- Photos never leave the device

## Run under Averonsoft

Mounted at `/passport-photo`. Optional CNAME: `passport.averonsoft.com`
(see `DETACH.md`).

## Standalone

```bash
npm install
npm run dev
```
