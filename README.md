# Chassis Decoder

Paste in a 17-character VIN and it pulls the vehicle's details from the NHTSA
database — make, model, year, engine, drivetrain, where it was built, and a
recall check. You can also download the report as a PDF.

Live: https://chassis-decoder.vercel.app

## What it does

- Decodes any valid VIN using NHTSA's public vPIC API (no key needed).
- Checks NHTSA for open safety recalls on that VIN.
- Optionally searches the web for salvage/auction records if a Serper key is set.
- Only shows what actually comes back — missing fields are left out instead of
  guessed. Nothing is faked.

## Running it locally

```bash
git clone https://github.com/hazypak/chassis-decoder.git
cd chassis-decoder
npm install
npm run dev
```

Then open http://localhost:3000.

## Environment variables

All of these are optional — the app works out of the box because NHTSA is public.
Add them if you want the extra bits:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` — turns on the
  Cloudflare Turnstile captcha before a lookup. If they're not set, the captcha
  is skipped.
- `GROQ_API_KEY` — used to tidy up the report's markdown formatting. Skipped if absent.
- `SERPER_API_KEY` — used for the salvage/auction web search. Skipped if absent.

## Stack

Next.js (App Router), React, and Tailwind. That's about it.

## Note on ads

The banner slots are just placeholders right now — no ad network is loaded.
