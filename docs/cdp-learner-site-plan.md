# CDP Learner Area — Plan for the Main Site

**Repository:** the main site (`antitect.org`, Next.js). Not this one.
**Source spec:** `docs/cdp-delivery-spec.md`, §§1, 2, 4, 5.1, 5.3, 6.1, 6.3, 9, 11, 14.
**The CRM half:** M9 in `docs/implementation-plan.md`, which builds every endpoint named here.

This document is the contract. It is written for whoever builds the learner area on the site, and it
holds everything that side needs without reading the CRM's code.

---

## 1. What the site builds, and what it never holds

The site builds one thing: the place a learner logs in to see what they must do next, and does it.

| Owns | Where |
|---|---|
| Learner accounts, enrolments, sessions, projects, submissions, feedback, attendance, certificates | The API. Only the API. |
| Running a programme: schedule, briefs, resources, review, marking complete, issuing certificates | The CRM portal, `admin.antitect.org`. **Programme management is entirely in the CRM.** The site never gains an admin screen. |
| The learner's pages at `/learn`, and the public certificate check at `/verify/[code]` | The site. |

The site stores no learner data of its own: no database, no mirrored schedule, no cached submission.
Every page reads from the API per request. The only thing it keeps is the session cookie.

**Nothing here changes the marketing pages.** `/learn` goes in its own route group, never
cached, rendered per request. The public programme pages change only as §7 below describes.

---

## 2. Sessions and authentication

The API issues a learner session. It is signed with a secret of its own and checked by a guard of its
own, so it cannot be mistaken for an admin login, and the CRM's tokens cannot be used here either.

**Two environments are supported, and they behave differently.** Ask the CRM session which one you
are pointed at before debugging a login that will not stick.

| Environment | Site | API | Cookie |
|---|---|---|---|
| **Production, once DNS is done** | `antitect.org` | `api.antitect.org` | first-party, `SameSite=Lax`. Works everywhere. |
| **Today** | `antitect-site.vercel.app` | `antitect-crm.onrender.com` | third-party, `SameSite=None; Secure`. **Safari and Brave drop it.** Test in Chrome, and treat iPhone login as unavailable until the domains match. |

Because of that second row, prefer this shape wherever the framework allows it: **call the API from
the server** — a route handler or server component — forwarding the learner's cookie, rather than
calling it from the browser. Server-to-server there is no third-party cookie problem at all, and the
token never reaches client JavaScript. Where you must call from the browser, use
`credentials: 'include'`; the API allows credentials on `/api/learner/*` for the site's origin only.

Never put the token in `localStorage`, and never read it in client code. It is httpOnly for a
reason: the learner area is public-facing, and an injected script must not be able to lift a session.

**Route protection** is middleware over `/learn`, except `/learn/login`, `/learn/invite/[token]`,
`/learn/forgot` and `/learn/reset/[token]`. A request with no session redirects to
`/learn/login?next=<path>`. A 401 from the API mid-session does the same. A 403 means logged in but
not enrolled in what was asked for — show "You are not enrolled in this programme", not the login
page.

---

## 3. The API contract

Base: `/api/learner/*` for everything a learner reads or writes; `/api/public/*` for the two public
pieces. Every error, on every endpoint, is:

```json
{ "error": { "message": "…", "code": "…", "details": { "field": ["…"] } } }
```

`message` is written for a person and can be shown as it is. `details` is present on validation
failures and maps field name to messages, for putting errors on form fields.

All times are ISO 8601 in UTC. **The site displays them in `Africa/Lagos` and names the zone** —
"Tue 14 Oct, 7:00pm WAT". Never show a raw UTC time and never assume the reader's device zone.

### 3.1 Authentication

```
POST /api/learner/auth/accept-invite   { token, password }        → 200, sets the cookie
POST /api/learner/auth/login           { email, password }        → 200, sets the cookie
POST /api/learner/auth/logout                                     → 200, clears it
POST /api/learner/auth/forgot          { email }                  → always 200
POST /api/learner/auth/reset           { token, password }        → 200, sets the cookie
POST /api/learner/auth/resend-invite   { token }                  → 200
```

- `forgot` answers 200 whether or not the address is known. The page says "If that address has an
  account, a link is on its way" — never "no such account".
- An expired or used invite token gives 410 `TOKEN_EXPIRED`. That page offers one button, which posts
  the same dead token to `resend-invite`; the API sends a fresh link **to the address already on
  file**. The page must not have an email field: a typed address would let anyone probe who is
  enrolled.
- `login` is rate limited. On 429, show the message the API returns rather than a generic error.
- Password rules come back as `details.password` on 400. Show them on the field.

### 3.2 The learner's own data

```
GET   /api/learner/me
GET   /api/learner/enrollments
GET   /api/learner/programs/:id
GET   /api/learner/programs/:id/sessions
GET   /api/learner/programs/:id/projects
GET   /api/learner/programs/:id/projects/:projectId
POST  /api/learner/programs/:id/projects/:projectId/submissions
PATCH /api/learner/enrollments/:id/certificate-name
GET   /api/learner/enrollments/:id/certificate
GET   /api/learner/calendar/:calendarFeedToken.ics
```

**`GET /me`**

```json
{ "learner": { "id": "…", "firstName": "Ada", "lastName": "Lovelace", "email": "…" } }
```

**`GET /enrollments`** — every programme this learner is on. Drives the switcher.

```json
{ "items": [ {
  "id": "…",
  "status": "confirmed",
  "program": { "id": "…", "slug": "…", "title": "AI Automation Applied",
               "runLabel": "Cohort 1", "startsAt": "2026-10-13T08:00:00.000Z",
               "durationWeeks": 6, "phase": "running" },
  "progress": { "approved": 2, "total": 6 }
} ] }
```

**`GET /programs/:id`** — everything the dashboard leads with.

```json
{
  "program": { "id": "…", "title": "…", "runLabel": "Cohort 1", "startsAt": "…",
               "durationWeeks": 6, "phase": "running", "timezone": "Africa/Lagos",
               "meetUrl": "https://meet.google.com/…", "bookingUrl": "https://cal.com/…",
               "certificateEnabled": true },
  "enrollment": { "id": "…", "status": "confirmed", "certificateName": null, "completedAt": null },
  "nextSession": { "id": "…", "week": 3, "title": "…", "startsAt": "…", "endsAt": "…",
                   "joinUrl": "…", "status": "scheduled" },
  "currentProject": { "id": "…", "order": 3, "title": "…", "deadlineAt": "…", "state": "in_progress" },
  "progress": { "approved": 2, "total": 6 },
  "latestFeedback": { "projectId": "…", "projectTitle": "…", "version": 1,
                      "status": "revision_required", "feedback": "…", "reviewedAt": "…" }
}
```

`nextSession`, `currentProject` and `latestFeedback` are null when there is none. **Prefill the
booking link** with the learner's name and email as Cal.com's `name` and `email` parameters, so they
do not retype them.

**`GET /programs/:id/sessions`**

```json
{ "items": [ { "id": "…", "week": 1, "title": "…", "startsAt": "…", "endsAt": "…",
               "joinUrl": "…", "recordingUrl": null, "status": "scheduled" } ] }
```

`status` is `scheduled`, `cancelled` or `completed`. `recordingUrl` is an unlisted YouTube link,
present only after the session. A cancelled session stays in the list, shown as cancelled.

**`GET /programs/:id/projects`**

```json
{ "items": [ { "id": "…", "order": 1, "week": 1, "title": "…", "whatYoullBuild": "…",
               "deadlineAt": "…", "state": "approved", "isLate": false,
               "latestSubmission": { "id": "…", "version": 1, "status": "approved",
                                     "submittedAt": "…" } } ] }
```

`state` is the one word the UI renders, already worked out per learner:

| `state` | Means | The UI offers |
|---|---|---|
| `locked` | The previous project is not approved yet | Nothing. Say which project must be approved first. |
| `in_progress` | Open, nothing submitted | The submission form |
| `submitted` | Waiting to be picked up | Nothing. Say it is with the reviewer. |
| `under_review` | Being reviewed now | Nothing |
| `revision_required` | Changes asked for | The form again, with the feedback above it |
| `approved` | Done | The feedback, read-only |

**Every project is visible from day one**, including locked ones, so learners can follow the live
sessions. Show a locked project's brief; only submission is closed.

**`GET /programs/:id/projects/:projectId`** — adds the full brief and the history.

```json
{
  "project": { "id": "…", "order": 1, "week": 1, "title": "…",
               "whatYoullBuild": "…", "whatYoullGain": "…",
               "brief": "markdown", "requirements": "markdown",
               "submissionGuidelines": "markdown",
               "deadlineAt": "…", "state": "revision_required" },
  "resources": [ { "id": "…", "type": "brief", "title": "Project 1 brief",
                   "url": "https://drive.google.com/…", "available": true, "releaseAt": null } ],
  "submissions": [ { "id": "…", "version": 1, "links": [ { "label": "Demo", "url": "…" } ],
                     "notes": "…", "status": "revision_required", "isLate": false,
                     "submittedAt": "…", "reviewedAt": "…", "feedback": "markdown" } ]
}
```

**`available: false` means the link is not there yet** — `url` is null and the resource is listed by
title only. Show the title and when it opens. Do not ask the API again hoping for a different answer.

`brief`, `requirements`, `submissionGuidelines` and `feedback` are Markdown. Render them with the
site's existing Markdown handling. **Escape it properly** — this text is written in the CRM, but
feedback still ends up on a public-facing page.

**`POST /programs/:id/projects/:projectId/submissions`**

```json
{ "links": [ { "label": "Loom demo", "url": "https://…" } ], "notes": "…" }
```

201 with the created submission. **Links only — there is no file upload anywhere in the learner
area.** At least one link is required. Refusals: 409 `PROJECT_LOCKED` (the previous project is not
approved), 409 `SUBMISSION_IN_REVIEW` (one is already with the reviewer), 400 with
`details.links`. **A submission after the deadline is accepted** and comes back `isLate: true`;
never block it, and warn rather than stop when the deadline has passed.

**`PATCH /enrollments/:id/certificate-name`** `{ "certificateName": "Ada Lovelace" }`. Names on file
are often nicknames, so this is confirmed before a certificate exists.

**`GET /enrollments/:id/certificate`** — 404 until one is issued.

```json
{ "certificate": { "number": "ANT-AAA-2026-0001", "verificationCode": "…", "name": "…",
                   "programTitle": "…", "runLabel": "Cohort 1", "completedOn": "…",
                   "issuedAt": "…", "revokedAt": null } }
```

**The calendar feed** is a subscription, not a download: `GET /api/learner/calendar/:token.ics`,
where the token comes from `GET /me`. It is authenticated by that token in the URL, because calendar
apps cannot send cookies, so treat the URL as a secret — offer it as a subscribe link and a copy
button, never print it in shared page text. Moved and cancelled sessions flow through on their own,
though Google Calendar can take hours to refresh, which is why reminders still go out by email and
WhatsApp.

---

## 4. Pages

Mobile first. Most of this is read on a phone, often minutes before a session.

| Route | Holds |
|---|---|
| `/learn/login` | Email and password. Link to forgot. |
| `/learn/invite/[token]` | Set a password. Expired → the single resend button of §3.1. |
| `/learn/forgot`, `/learn/reset/[token]` | Reset, with the neutral wording. |
| `/learn` | **Dashboard.** Next session with a relative label ("Thursday, in 2 days") and a join button; the current project with its deadline and state; progress out of six; the most recent feedback; "Book your project review". |
| `/learn/schedule` | Sessions by week, join links, recordings for past ones, "Add to calendar". |
| `/learn/projects` | All six with their state, in order. |
| `/learn/projects/[id]` | Brief, requirements, resources, the submission form, and every version with its feedback. |
| `/learn/certificate` | Confirm the name, then view and print once issued. |
| `/verify/[code]` | **Public.** Certificate verification. |

**The dashboard answers one question: what do I do next?** Lead with the next session and the
current project. Everything else is secondary. If the learner is on more than one programme, show a
switcher and default to the running one.

Use the site's existing brand system — the tokens, the cut-from-the-mark geometry, the ticket
treatment for sessions. The learner area is the same product, not a bolted-on portal.

**The join button** goes to the session's `joinUrl` and should be prominent from about an hour
before until the end. Outside that window it is still there, just quieter.

---

## 5. The rules the UI has to reflect

These are enforced by the API. The UI mirrors them so nothing looks available that is not.

- **Projects are submitted in order.** Project N opens when N−1 is approved. All of them are visible
  throughout.
- **Late work is accepted and flagged.** Never hide the form because a deadline passed.
- **After submitting, nothing is editable.** The learner waits for a decision; a revision is a new
  version, never an edit of the last.
- **A resource with `available: false` has no link yet.** Title only.
- **Enrolment, not login, is what entitles.** A 403 is a real answer, not a bug.
- **Times are WAT and say so.**

---

## 6. Certificates

The API issues the record; the site renders it. `/learn/certificate` shows the name-confirmation
form until a certificate exists, then the certificate itself, **laid out for print** so the browser
saves it as a PDF. No file is downloaded from the API, and no PDF is generated anywhere.

`/verify/[code]` is public and indexable-safe: it shows the name, programme, run label, completion
date and certificate number, and whether it is valid or revoked. **A revoked certificate still
verifies** and says it was revoked. It shows no email address, no phone number and nothing else about
the person.

```
GET /api/public/certificates/:verificationCode
→ { "valid": true, "revokedAt": null, "number": "ANT-AAA-2026-0001", "name": "…",
    "programTitle": "…", "runLabel": "Cohort 1", "completedOn": "2026-11-24" }
→ 404 CERTIFICATE_NOT_FOUND for an unknown code
```

---

## 7. The public programme pages change slightly

This is the one change outside `/learn`, and it matters: **once a run closes, its page must not
404**, or every link already shared on WhatsApp breaks.

`GET /api/public/programs/:slug` keeps every field it returns today and gains three:

```json
{ "phase": "finished", "runLabel": "Cohort 1",
  "nextRun": { "slug": "ai-automation-applied-2", "runLabel": "Cohort 2", "startsAt": "…" } }
```

- `phase` is `enrolling`, `running` or `finished`. Enrol only while `enrolling`.
- A run that is running or finished shows **"Enrolment for Cohort 1 has closed"** and, when
  `nextRun` is not null, a link to it. When it is null, the community signup instead.
- `GET /api/public/programs` still lists only runs open for enrolment. Nothing changes there.
- The page 404s only for a draft or cancelled run, as it does today.

Every other public response is unchanged. **The API adds fields and never renames or removes
them**, so nothing existing needs touching.

---

## 8. Build order

**The API side of each step lands first.** There is nothing to build against otherwise, and the
CRM's milestone numbers below are the ones to ask about.

| Step | Build | After CRM |
|---|---|---|
| **S1** | Login, invite, forgot, reset. Middleware, the session helper, the empty dashboard shell | M9-2 |
| **S2** | Dashboard and `/learn/schedule`, with the calendar subscription | M9-4, M9-6 |
| **S3** | `/learn/projects` and the project page, read-only, with resources | M9-5, M9-6 |
| **S4** | The submission form, version history and feedback | M9-7 |
| **S5** | The booking link on the dashboard, prefilled | M9-8 |
| **S6** | `/learn/certificate` and the public `/verify/[code]` | M9-9 |
| **S7** | Closed-run programme pages and `nextRun` | M9-11 |

Each step is worth a working check with a real account against the CRM's test data before the next
one starts.

---

## 9. Not in this phase

Booking (Cal.com holds it), video hosting (YouTube), file storage or uploads of any kind (Drive
links), attendance capture, discussion or chat in the learner area (the community is on WhatsApp),
quizzes, grades or scores, and any admin or instructor screen on the site. If something seems to
need one of these, stop and ask rather than building it.

---

## 10. Rules for whoever builds this

- The API is the only source of truth. The site stores no learner data.
- The session cookie is httpOnly. Never read it in client code, never copy it into storage.
- Prefer server-side calls to the API, forwarding the cookie.
- `/learn` is never cached, never statically rendered, and never affects how the marketing pages are
  cached.
- Show what the API says a learner may see. Do not hide a 403 by guessing, and do not reconstruct
  progression rules locally — `state` is already worked out per learner.
- Times in `Africa/Lagos`, with the zone named.
- Markdown from the API is rendered escaped.
- Public API fields are additive. If a shape looks wrong, ask the CRM side rather than working around
  it, because the contract is shared.
