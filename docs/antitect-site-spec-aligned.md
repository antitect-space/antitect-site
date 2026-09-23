# Antitect Public Site — Aligned Build Spec

**Supersedes `antitect-site-spec.md`** for everything except design. That document
described an API that is partly imaginary; this one describes the API that exists,
names precisely what does not exist yet, and says who has to build it.

**Repo:** separate from the CRM. Own repository, own deployment.
**Audience:** a Next.js coding agent, and the CRM team who must unblock it.

> **Design is deliberately untouched.** Sections 8, 9, 10 and 11 of the original
> spec — the split hero, Archivo, the token palette, the red proportion rule, the
> no-invented-social-proof rule, the performance budget — all still stand. Read
> them there. Nothing below changes them.

---

## 1. What is actually true today

Three applications. The CRM and API are one repository (`antitect-crm`, an npm
workspace) deployed as two services.

| App | Where | State |
|---|---|---|
| **Public site** (this repo) | to be decided, see §2 | not started |
| Admin CRM | separate deploy of `apps/web` | built and in use |
| API | `https://antitect-crm.onrender.com` today | built for events, **not for programmes** |

**The single most important correction to the old spec:** it said the API was
"already built" for programme enrolment and payment. It is not. Not a model, not
a route, not a Paystack key. See §7.

**This app still owns no data and no business logic.** It renders what the API
returns and posts what visitors submit. That part of the original spec holds.

---

## 2. Decisions the team must make before day 1

These are unresolved and block configuration, not code.

| # | Question | Why it blocks |
|---|---|---|
| 1 | **Which domain?** The old spec says `antitect.africa`. The CRM sends email from `notify.antitect.org` and `news.antitect.org`, so the organisation is using `.org` in production. | `og:url` must be canonical and absolute, and the API's CORS allowlist is an exact origin match. Getting this wrong breaks link previews and every browser-side POST. |
| 2 | **Where does the API finally live?** It is on Render now. The old spec assumed Railway and its private network (`INTERNAL_API_URL`). | Render has no equivalent private URL. Drop `INTERNAL_API_URL` unless the API moves to Railway. |
| 3 | **Is the API on a paid Render plan?** | A free instance sleeps after inactivity. A cold start can take 30–60 seconds, which fails a server render and blanks a WhatsApp link preview. This is not acceptable for the page every shared link lands on. |

---

## 3. The API contract, as built

Base URL from `NEXT_PUBLIC_API_URL`. Error body is the same shape everywhere:

```json
{ "error": { "message": "...", "code": "...", "details": { "field": ["..."] } } }
```

`details` is present only on validation failures.

| Code | Status | Means |
|---|---|---|
| `VALIDATION_ERROR` | 400 | A field is wrong. `details` maps field name to messages. Also returned when registering for an event that has already started. |
| `EVENT_NOT_FOUND` | 404 | No such event, **or it is a draft, or it is cancelled**. Deliberately indistinguishable. |
| `EVENT_FULL` | 409 | Capacity reached. |
| `RATE_LIMITED` | 429 | Too many requests from this IP. |

### `GET /api/public/events`

Published events that have **not yet started**, soonest first. Paginated.
Query: `page` (default 1), `limit` (default 25, max 100).

```json
{
  "items": [ /* the event shape below */ ],
  "page": 1, "limit": 25, "total": 1, "totalPages": 1
}
```

It is an envelope, not a bare array. The landing page wants `items[0]`.

### `GET /api/public/events/:slug`

The event shape, at the top level — **not wrapped in `{ event: ... }`**:

```json
{
  "title": "Automation for Business",
  "slug": "automation-for-business",
  "description": "Ideas, systems and real impact.\n\nA free two-hour session...",
  "startsAt": "2026-09-12T09:00:00.000Z",
  "imageUrl": "https://res.cloudinary.com/.../events/ab12.png",
  "capacity": 100,
  "spotsRemaining": 34,
  "isFull": false
}
```

Notes that will bite if missed:

- **`joinUrl` is never here.** It goes only to confirmed registrants, by email.
  Do not look for it and do not add a "join" button to a public page.
- **`imageUrl` can be `null`.** Fall back to the default `opengraph-image`.
  Never emit an empty `og:image`.
- **`capacity` and `spotsRemaining` are `null` when there is no limit.** Null is
  "unlimited", not zero. `isFull` is `false` in that case.
- **`description` is plain text with newlines**, authored in the CRM. Render with
  `whitespace-pre-line`. It is not Markdown and not HTML.
- **A past event still returns 200 here**, unlike in the list. Somebody following
  a link from an old message should read the page. Registration is what closes.
  Compare `startsAt` to now and hide the form yourself.
- There is **no `type` field**, so the page cannot read "webinar" from the data,
  and **no `endsAt`**, so a time range cannot be shown. See §7 for both.

### `POST /api/public/events/:slug/register`

Request:

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "phone": "08012345678",
  "state": "Lagos",
  "whatsappOptIn": true
}
```

- `firstName` required, 1–120 characters.
- **At least one of `email` or `phone`.** Violating this puts the error on the
  `email` field in `details`.
- `phone` is free text. A Nigerian number can be local (`08012345678`); a number
  from anywhere else needs its country code (`+233241234567`). The API normalises
  to E.164 and rejects what it cannot place, as `VALIDATION_ERROR` on `phone`.
- `state` is free text, optional.
- **`preferredChannel` is not accepted.** The objective asks for it on the form;
  the API takes `whatsappOptIn` instead. See §7 item 2.

Response, `201` when created and **`200` when already registered**:

```json
{
  "registrationId": "6aa3d819ccb27738d33fa5bc",
  "channel": "email",
  "sentTo": "a***@example.com",
  "alreadyRegistered": false,
  "event": { "title": "Automation for Business", "startsAt": "2026-09-12T09:00:00.000Z" }
}
```

- `sentTo` is masked. Show it, so people know where to look, and never expect a
  full address.
- **`alreadyRegistered: true` is a success**, rendered as the confirmed state.
  Nothing is resent, so word it in the past tense: "we sent the details to…",
  not "check your inbox now", which would leave them waiting for an email that
  is not coming.

---

## 4. Constraints the old spec did not know about

### Rate limiting will throttle a server-rendered site

The API limits **public reads to 100 per 15 minutes per IP**, and registrations
to **10 per hour per IP**.

A Next.js server fetching on every request presents **one IP for every visitor**.
Without caching, the 101st page view in a quarter of an hour gets a 429 and the
site breaks for everybody.

This is exactly why the original spec's `revalidate: 60` matters. It is not a
nicety; it is what keeps the site inside the limit. With a 60 second revalidate,
each route costs at most 15 API reads per 15 minutes.

- Put `export const revalidate = 60` on `/`, `/events/[slug]`.
- Never fetch the event list or detail from the browser on page load.
- The **registration POST must go from the browser**, so each visitor spends
  their own IP allowance rather than the server's. Posting it server-side would
  exhaust ten registrations an hour for the whole site.

### CORS is an exact origin match

The API allows `/api/public/*` from `MAIN_SITE_URL` and `ADMIN_APP_URL` only,
never a wildcard. **The CRM team must set `MAIN_SITE_URL` to the site's exact
origin**, scheme and all, before any browser POST works. Its default is
`http://localhost:5174`.

Server-side fetches send no `Origin` header and are unaffected, which is why
reads work while the registration form silently fails if this is missed.

### Images come from two possible hosts

`imageUrl` is absolute and its host depends on the CRM's `STORAGE_PROVIDER`:
the API's own domain (`/uploads/...`) or Cloudinary. Configure `next/image`
`remotePatterns` for **both**, or images will not render.

The CRM team must set `STORAGE_PROVIDER=cloudinary` in production. Local storage
loses every uploaded image when the container restarts, and the event image is
the share preview.

### Times are UTC; display is Lagos

`startsAt` is an ISO instant. The audience spans several African timezones, so
**format to `Africa/Lagos` and name the zone** — "Saturday 12 September, 10:00 am
West Africa Time". A bare "10am" is read as local time by everyone outside Lagos
and costs attendance. `Intl.DateTimeFormat` with `timeZone: 'Africa/Lagos'` does
this with no dependency.

---

## 5. Pages

Unchanged from the original spec in structure and order. Corrections only:

### `/` — landing

Read `GET /api/public/events` and take `items[0]`. The list already excludes
drafts, cancelled events and anything that has started, so **if `items` is empty,
hide the webinar section entirely** — no empty state, exactly as specified.

### `/events/[slug]`

404 when the API 404s. Remember that covers drafts and cancelled events too, so
never explain *why* — "this event does not exist" is the whole message.

Render the form only when the event has not started and `isFull` is false. When
`isFull`, say so and do not show the form. Read `spotsRemaining` to show a
nearly-full state if you want one.

On success show which channel the confirmation went to and the masked address.

### `/programs/[slug]` and `/enroll/complete`

**Blocked.** Nothing behind these exists. See §7. Do not build placeholder pages
that call endpoints returning 404; build them when the API lands, and use the
payment rules in the original spec §7 verbatim when you do — especially that the
return page never claims success on arrival.

---

## 6. Build order

Two deadlines, as the objective sets out: registration as early as possible,
enrolment by the webinar.

| # | Milestone | Done when |
|---|---|---|
| 1 | Next.js app, Tailwind, tokens, Archivo, deployed on the real domain | The live URL serves a styled page |
| 2 | `lib/api.ts`, landing hero and webinar section on real data, `revalidate: 60` | A published event appears on the live site |
| 3 | `/events/[slug]`, registration form, `generateMetadata` | Registering from a phone delivers a real confirmation, and the link previews in a real WhatsApp chat |
| 4 | Remaining landing sections | The page reads end to end on a phone |
| 5 | `/programs/[slug]` with enrolment | **Blocked on §7 item 1** |
| 6 | `/enroll/complete` with polling | **Blocked on §7 item 1** |

**Milestone 3 is the one that matters.** After it the webinar can run even if
nothing else lands. Do not start 5 or 6 until the API endpoints exist.

---

## 7. What the CRM must build first

Work in `antitect-crm`, not in the site repo. Ordered by what blocks most.

### 1. Programmes, enrolment and payment — blocks site milestones 5 and 6

Nothing exists. The whole vertical is needed:

- A `programs` collection: name, slug, description, cohort start, duration, price,
  capacity, image, `status` with the same draft/published gate events use.
- An `enrollments` collection holding a payment reference and a status that is
  only `confirmed` by a verified webhook, never by a browser arriving anywhere.
- Paystack initialisation, and a **signature-verified webhook** that confirms
  payment and triggers the confirmation message.
- Public endpoints matching what the site expects:
  `GET /api/public/programs/:slug`,
  `POST /api/public/programs/:slug/enroll` returning an `authorization_url`,
  `GET /api/public/enrollments/:reference/status`.
- Admin screens to create, publish and watch enrolments.

Reuse what is there: the events slice is the template for the publish gate and
the capacity counter, `sendMessage` for the confirmation, and the Resend webhook
in `apps/api/src/routes/webhooks.ts` as the pattern for verifying Paystack's.

Paystack is a new dependency and a new set of secrets. Both need approving.

### 2. Accept `preferredChannel` on public registration — blocks nothing, wanted by the objective

The objective says people choose a preferred channel when registering. The API
accepts `whatsappOptIn` instead, though `contacts.preferredChannel` exists and the
CRM already shows it. Add it to the register body in
`apps/api/src/routes/public.ts` and pass it to `upsertContact`.

Until then the site should send `whatsappOptIn: true` when somebody picks
WhatsApp, which records the intent even if it does not set the preference.

### 3. Fix the channel the registration response reports — do before WhatsApp goes live

`apps/api/src/routes/public.ts` reports `channel` from the section 9
recommendation, but `apps/api/src/services/confirmations.ts` hardcodes
`channel: 'email'`. They agree only while email is the one enabled channel. The
moment WhatsApp is switched on, the response can tell somebody to check WhatsApp
while an email was sent. Report what was actually sent.

### 4. Add `type` and `endsAt` to the public event — small, and the site wants both

`type` is `webinar` or `workshop` in the CRM and absent from the public shape, so
the page cannot label the event from data. There is no `endsAt` at all, so a
range like "10AM – 12PM" cannot be shown; the flyer for the first event used one.

Both are additive, which the contract permits. `endsAt` needs a model field and a
form field as well as the response.

### 5. Configuration, not code

- `MAIN_SITE_URL` set to the site's exact origin, or browser POSTs fail on CORS.
- `API_BASE_URL` set to the API's public URL. It builds the calendar link, the
  unsubscribe link and the email logo; left on localhost they all break.
- `STORAGE_PROVIDER=cloudinary`, or event images vanish on restart.
- Consider raising `RATE_LIMIT_PUBLIC_READ_MAX` if the site cannot cache.

---

## 8. Rules for the agent

Carried from the original spec, plus what this alignment adds.

- This app owns no data and no business logic. Everything goes through the API.
- **Do not call an endpoint listed in §7 as unbuilt.** It will 404. Ask instead.
- No secrets, ever. No payment keys, no database credentials, no API keys.
- Never show payment success without confirmation from the API.
- Do not invent testimonials, logos, ratings, statistics or outcomes.
- Do not add dependencies without asking.
- Cache reads and post registrations from the browser, for the reasons in §4.
- Never clear a form on a failed submit.
- Test on a real phone over mobile data, and verify link previews by pasting a
  real link into a real WhatsApp chat. Nothing else proves either works.
