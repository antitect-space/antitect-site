# antitect-site

Antitect's company website at `antitect.org`. It says what Antitect is, and
moves people from the community (free) to events (free webinars, paid
workshops) to Capability Development Programmes (paid).

It owns no data. Events, programmes, prices, dates, payments and community
signups all live in the CRM (`antitect-crm`). Anything published or edited there
shows here within about a minute, with no deploy.

- **Copy and structure:** [`docs/antitect-site-copy.md`](docs/antitect-site-copy.md)
- **Design and performance rules:** [`docs/antitect-site-spec.md`](docs/antitect-site-spec.md), §8–§11
- **API contract:** `docs/antitect-site-spec-aligned.md` §3 **in the CRM repo**,
  which is kept current. The copy in this repo's `docs/` is an older snapshot.

## Pages

| Route | What it is |
|---|---|
| `/` | Company home: hero with a "Next up" panel, premise, how it works, upcoming events, programmes, why Antitect, FAQ, community |
| `/events`, `/events/[slug]` | Events. Free ones register; paid ones go through Paystack checkout |
| `/programmes`, `/programmes/[slug]` | Capability Development Programmes, with enrolment and checkout. `/programs/*` redirects here |
| `/community` | The community signup form, then the WhatsApp community link |
| `/payment/complete` | Paystack's return page. Always starts by checking and polls the API; never shows success on arrival |
| `/sitemap.xml`, `/robots.txt` | Generated |

About is left out on purpose until its copy exists.

## Run it

```sh
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at an API
npm run dev                  # http://localhost:5174
```

Port 5174 is the CRM API's default `MAIN_SITE_URL`, so a local API accepts
browser posts without CORS changes.

```sh
npm run lint
npm run typecheck
npm run build && npm start   # caching only behaves as in production here
```

To exercise payments locally, run the CRM API with `PAYMENT_PROVIDER` unset
(the console provider). Checkout then returns straight to `/payment/complete`,
and `npm run payments:simulate -w apps/api -- <reference> [--fail | --received]`
in the CRM repo settles the payment. Never point a local API at a production
database or give it a live Paystack key.

## Environment

All of these are read at build time, so set them before `npm run build`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, `https://antitect.org`. Every canonical link, share URL and sitemap entry is built from it. |
| `NEXT_PUBLIC_API_URL` | Public API origin. The browser posts here. |
| `INTERNAL_API_URL` | Optional private-network API address for server-side reads. |

There are no secrets in this app, and there should never be. The Paystack key
lives only in the API.

## How it fits together

- **`lib/api.ts` is the only code that calls the API.**
  - Server reads are cached for 60 seconds. The API allows 100 public reads per
    15 minutes per IP, and the server is one IP for every visitor. If the API
    fails during a refresh, the last good page keeps being served.
  - Form posts, discount quotes and payment polling run in the browser, so each
    visitor spends their own rate limit.
- **Figures come only from the CRM.** Price, duration, session count and dates
  are never written into copy. `lib/programs.ts` builds the fixed sentences
  around them, and leaves a sentence out when a figure is missing.
- **No price in any meta description or share image.** Link previews are cached
  long after a price changes.
- **Forms:** `lib/schemas.ts` holds one person schema for every form (email and
  WhatsApp number both required, as the API requires). Location is required
  too: a state from `lib/locations.ts`, posted with `country: "Nigeria"`, or
  "Outside Nigeria" and a typed country, posted as `country` alone. `lib/form-errors.ts`
  maps every API error to one of four outcomes, and no form clears its input on
  failure.
- **`content/`** holds copy the CRM does not manage: the method, why Antitect,
  and the FAQ. FAQ answers that need a figure are built from the next
  programme's record.
- **JavaScript:** before load, the home page ships only the framework's own
  script (about 150KB transferred). The FAQ and the mobile menu are native
  `<details>` elements.

## Before launch

- `grep -r "TODO(content)" app components content lib` returns nothing (today:
  the WhatsApp community invite link in `lib/site.ts`).
- The CRM API has `MAIN_SITE_URL=https://antitect.org` exactly,
  `STORAGE_PROVIDER=cloudinary`, and the Paystack key and webhook configured.
- The host redirects `www.antitect.org` to `antitect.org` (the old site does the reverse).
- Register, pay and enrol from a real phone over mobile data.
- Paste the home page, an event link and a programme link into a real WhatsApp
  chat and check each preview.
