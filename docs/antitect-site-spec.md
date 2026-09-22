# Antitect Public Site — Build Spec

**Repo:** separate from the CRM. Own repository, own deployment.
**Week 1 deliverable.** Audience: Next.js coding agent.

---

## 1. Context

Antitect is an Africa-focused AI education company. It runs free webinars that lead into paid Capability Development Programmes — the first being **AI Automation Applied**, a six-week instructor-led programme at ₦100,000.

This project is the **public site** at `antitect.africa`. It is where every link shared on WhatsApp, social and email lands. Its job is narrow: get people to register for the webinar, and get people to enrol and pay for the programme.

It is one of three applications:

| App | Domain | Owns |
|---|---|---|
| **Public site** (this repo) | `antitect.africa` | Everything a visitor sees |
| Admin CRM | `admin.antitect.africa` | Internal tool, already built |
| API | `api.antitect.africa` | All data, sending, payments, already built |

**This app owns no data and no business logic.** It renders what the API returns and posts what visitors submit. If a task here seems to need a database, a scheduled job, or a payment SDK, it belongs in the API — stop and ask.

---

## 2. Scope

### In scope

- Landing page: hero, webinar, programme, FAQ, footer
- Event detail page with registration
- Programme detail page with enrolment and payment hand-off
- Payment return page
- Correct link previews on every public URL
- Mobile-first, fast on Nigerian mobile data

### Out of scope — do not build

- Any learner-facing area: dashboards, project submission, progress. That is week 2 and a different surface.
- Blog, about page, team page, careers
- Authentication of any kind. No visitor logs in here.
- A CMS. Content comes from the API or lives in the repo.
- Testimonials, case studies, client logos, review badges. **Antitect has none yet** — see §10.
- Multiple programmes. There is one. Build for one, do not generalise.

---

## 3. Stack and constraints

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui, plus marketing blocks as a starting point (§8) |
| Forms | React Hook Form + Zod resolver |
| Validation | Zod, defined in this repo (no shared package — see below) |
| Hosting | Railway, long-running Node (`next start`) |

**Constraints:**

- **Server-render the pages that get shared.** Link previews depend on it (§9).
- No state management library. Server components fetch; forms hold their own state.
- No analytics, tag managers, chat widgets, or cookie banners this week. Each one costs mobile load time and none of them earns a registration.
- Do not add dependencies beyond the above without asking.

**On validation schemas:** the CRM project dropped its shared package, so the registration and enrolment schemas are duplicated here. Keep them in one obvious file (`lib/schemas.ts`) and keep them short, because a field change now means editing two repositories.

---

## 4. Repo structure

```
antitect-site/
  app/
    layout.tsx
    page.tsx                      # landing
    events/[slug]/page.tsx        # event detail + registration
    programs/[slug]/page.tsx      # programme detail + enrolment
    enroll/complete/page.tsx      # Paystack return — see §7
    opengraph-image.tsx           # default share image
  components/
    sections/                     # hero, webinar, programme, faq, footer
    forms/                        # registration, enrolment
    ui/                           # shadcn
  lib/
    api.ts                        # the only place that calls the API
    schemas.ts                    # Zod
public/
```

All API calls go through `lib/api.ts`. No component fetches directly.

---

## 5. Pages

### `/` — landing

One page, sections in this order. This order is the argument: what it is → the immediate free thing → what you will be able to do → the paid thing → objections → footer.

1. **Hero** (§8)
2. **Upcoming webinar** — title, date and time with timezone named, what it covers, register
3. **How it works** — Learn → Build → Review → Improve → Apply. This is Antitect's actual method and the most characteristic thing it has; give it room.
4. **AI Automation Applied** — what it is, six weeks, what you build, what you leave with, ₦100,000, enrol
5. **FAQ** — the DLI document's eleven questions are already written; use them, edited for length
6. **Footer** — contact, a real reply-to address, socials

If the webinar has passed or none is published, the webinar section is hidden entirely rather than showing an empty state.

### `/events/[slug]`

Full event detail and the registration form. Server-rendered with per-event metadata. Returns 404 for an event the API does not return as published.

On success: a confirmation state naming **which channel** the confirmation was sent on (the API returns this), so people know where to look. Never a bare "thanks".

### `/programs/[slug]`

Full programme detail and the enrolment form. Shows price, cohort start date, and places remaining when the API reports a capacity.

### `/enroll/complete`

The Paystack return page. Read §7 before building it.

---

## 6. API contract

Base URL from `NEXT_PUBLIC_API_URL`. Server-side fetches may use the internal Railway URL; browser fetches use the public one.

| Call | Used by |
|---|---|
| `GET /api/public/events` | Landing page webinar section |
| `GET /api/public/events/:slug` | Event page + its metadata |
| `POST /api/public/events/:slug/register` | Registration form |
| `GET /api/public/programs/:slug` | Programme page + its metadata |
| `POST /api/public/programs/:slug/enroll` | Enrolment form — returns a Paystack `authorization_url` |
| `GET /api/public/enrollments/:reference/status` | Return page polling |

**Errors to handle explicitly**, not as a generic failure:

- `EVENT_FULL` / `PROGRAM_FULL` (409) — say it is full, do not offer the form
- `VALIDATION_ERROR` (400) — map `details` back onto the specific fields
- `RATE_LIMITED` (429) — ask them to wait a moment, keep their input
- `alreadyRegistered: true` — show **success**, not an error. From the visitor's side it worked.

Never clear a form on a failed submit. On a slow connection, retyping is where people give up.

---

## 7. The payment flow

```
Enrolment form
  → POST /enroll  → API creates a pending enrolment, initialises Paystack
  → redirect to Paystack's authorization_url
  → visitor pays on Paystack
  → Paystack redirects to /enroll/complete?reference=...
```

**The return page must not claim success.** Arriving there proves nothing: anyone can navigate to the URL directly, and a genuine payer can lose connection before it loads. Payment is confirmed by a webhook to the API, never by a browser arriving somewhere.

So the page shows a **pending** state — "We're confirming your payment" — and polls `GET /api/public/enrollments/:reference/status` every two seconds for up to thirty seconds. Confirmed within that window: show the confirmed state. Still pending after it: say the confirmation email will arrive shortly and give a contact address. Never show "You're enrolled" on page load.

Building this page to celebrate on arrival is the failure that lets someone who did not pay believe they have a place.

---

## 8. Design direction

The reference is a split hero: content left, panel right, oversized tight grotesque headline, near-monochrome with one image carrying all the colour, generous whitespace. **Keep that structure and that restraint.** Three things in it do not transfer.

**Geometry.** The reference uses pill buttons and a large corner radius. The Antitect mark is sharply angular with hard edges and no rounding anywhere. Use `--radius: 4px` on everything, and square edges on large panels. This is also the more distinctive choice — the pill-and-soft-corner look is currently everywhere, and the angular treatment is what makes the page look like Antitect rather than like a template.

**The right-hand panel.** In the reference it is a photograph with floating product-UI cards. That device works because the product *is* software with an interface worth showing. Antitect's product is a programme, so borrowed dashboard chrome would be dishonest and meaningless. Use the panel for the **webinar itself**: a hard-edged black panel carrying the event name, the date and time with timezone, and the register action. It is real content, it is the primary conversion point, and it puts the most time-sensitive thing above the fold.

**Social proof.** The reference opens with a review badge and closes with a client logo bar. Antitect has neither — see §10.

### Typography

**Archivo Variable**, one family throughout. It is a grotesque with tight apertures and a strong display range that suits the mark's angularity, and it is not Inter or Geist, which are the families every generated page reaches for.

- Display: 700–800, tracking tightened roughly `-0.02em`, leading tight (~0.95–1.05). Headlines should feel set, not typed.
- Body: 400, leading ~1.6, line length under 70 characters.
- One variable font file, subset to Latin, preloaded. Font weight is page weight.

Set headlines in **sentence case**. Do not colour or bold a single word inside a headline for emphasis, and do not put tracked-out capitals above sections as labels — both are the clearest tells of a generated page.

### Layout

Left-aligned throughout. Centred text at these display sizes gets hard to read on a phone, and left alignment suits the mark's squared geometry.

```
┌──────────────────────────────┬───────────────────┐
│ logo            nav          │                   │
│                              │   ███ WEBINAR     │
│ Learning should lead         │   ███ title       │
│ to the ability to do.        │   ███ date, time  │
│                              │   ███             │
│ [ body paragraph ]           │   ███ [Register]  │
│                              │                   │
│ [ Register free ] [ See CDP ]│                   │
└──────────────────────────────┴───────────────────┘
```

On mobile the panel stacks below the copy — but the register action must be reachable without a long scroll.

### Motion

One orchestrated moment on page load, or none. Do not put fade-and-slide-up entrances on every section or hover transitions on every card; that pattern reads as generated and costs load time on the devices your audience uses. Respect `prefers-reduced-motion`.

---

## 9. Design tokens

```css
:root {
  --background: #FEFEFE;
  --foreground: #0A0A0A;
  --brand: #CE1115;
  --brand-foreground: #FEFEFE;
  --muted: #F5F5F5;
  --muted-foreground: #5A5A5A;
  --border: #E5E5E5;
  --radius: 4px;
}
```

**Red is the primary call to action on this site**, which differs from the CRM. In the CRM red is reserved because it has to signal destructive actions — deleting a contact, a failed send. Nothing here is destructive, so the brand colour is free to do the job it is best at: marking the one thing you want people to click.

**Proportion is the rule that matters.** Roughly 70% white, 25% black, 5% red. Red appears three to five times on the entire page — the primary CTA, the webinar panel accent, the logo. Everything else is black on white. A page that is 30% red reads as loud, not confident; the mark itself demonstrates the correct ratio by accenting one letter.

Do not put red text on the black panel — measured at 3.72:1, it fails AA for body text. White on black, red as a fill or a rule.

---

## 10. Content Antitect does not have

The reference page leans on a review score and a client logo bar. Antitect has run no cohorts, so there are no testimonials, no alumni, no logos, and no outcomes to cite.

**Do not invent, placeholder, or imply any of them.** No "trusted by" row with grey boxes, no invented star rating, no stock headshots with fabricated quotes. A first cohort with no social proof is a normal thing to be, and faking it is both dishonest and transparent to the audience it targets.

Substitute real credibility instead:

- **Specificity about what you will build.** Concrete projects beat adjectives.
- **The method.** Learn → Build → Review → Improve → Apply is a real differentiator against passive video courses.
- **The structure.** Three live sessions a week, a thirty-minute one-to-one project review every week, progression by demonstrated completion. Those are unusual and verifiable.
- **The instructor**, named, with real background.

Write the copy from the visitor's side. "You will build X" beats "participants will develop capabilities." Buttons say what happens — "Register free", "Enrol — ₦100,000" — not "Submit" or "Learn more".

---

## 11. Performance

Not a polish item. Most visitors arrive on a mid-range Android over mobile data, often from a WhatsApp in-app browser, and a slow page loses registrations before anyone reads a word.

- **LCP under 2.5s on a 4G connection**, measured throttled, not on your laptop
- **Initial page weight under 500KB**, hero image included
- `next/image` everywhere, AVIF or WebP, explicit dimensions so nothing reflows while loading
- Hero image eager with `priority`; everything below the fold lazy
- One font file, subsetted and preloaded
- No third-party scripts

Marketing block libraries (§3) are a fast start, but the animated ones — Magic UI, Aceternity — carry significant JavaScript. Take the layout, drop the animation.

---

## 12. Link previews

Every shared link is a WhatsApp link. WhatsApp's crawler does not run JavaScript, so any page that gets shared must be server-rendered with real metadata in the HTML.

Use `generateMetadata()` on `/`, `/events/[slug]` and `/programs/[slug]`:

- `og:title`, `og:description` (~160 chars), `og:image` (absolute), `og:url` (absolute, canonical), `og:type`, `twitter:card`
- Event and programme images come from the API's `imageUrl`, already absolute
- Escape interpolated values — titles are admin-authored and an apostrophe breaks the tag
- `revalidate` of 60 seconds on these routes, so a burst of crawler hits does not hammer the API and a brief API blip does not cost a preview
- A default `opengraph-image` for `/` and any page without one. Never emit an empty `og:image`.

**Verify by pasting a real link into a real WhatsApp chat.** Nothing else proves it works.

---

## 13. Environment variables

```
NEXT_PUBLIC_SITE_URL=https://antitect.africa
NEXT_PUBLIC_API_URL=https://api.antitect.africa
INTERNAL_API_URL=                # Railway private network, server-side fetches
```

No secrets in this app. It holds no API keys, no payment keys, no database credentials. If a task appears to need one, it belongs in the API.

---

## 14. Build order

| # | Milestone | Done when |
|---|---|---|
| 1 | Next.js app, Tailwind, tokens, Archivo loaded, deployed to Railway on the domain | The live URL serves a styled page |
| 2 | `lib/api.ts`, landing hero and webinar section reading real API data | A published event appears on the live site |
| 3 | `/events/[slug]` with registration form and metadata | Registering from a phone delivers a real confirmation, and the link previews in WhatsApp |
| 4 | Remaining landing sections: how it works, programme, FAQ, footer | The page reads end to end on a phone |
| 5 | `/programs/[slug]` with enrolment form | Submitting reaches Paystack's checkout |
| 6 | `/enroll/complete` with polling | A real payment shows confirmed; loading the URL directly shows pending, never success |

**Milestone 3 is the one that matters most.** After it, the webinar can run successfully even if nothing else lands this week. Sequence accordingly.

---

## 15. Rules for the agent

- This app owns no data and no business logic. Everything goes through the API.
- No secrets, ever. Not in code, not in env, not in a comment.
- Do not build anything from §2's out-of-scope list. Ask instead.
- Do not invent testimonials, logos, ratings, statistics, or outcomes (§10).
- Do not add dependencies beyond §3 without asking.
- Never show payment success without confirmation from the API (§7).
- Test on a real phone over mobile data before calling anything done. A laptop on office wifi tells you nothing about how this performs for the people using it.
