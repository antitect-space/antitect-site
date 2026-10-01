# CDP Waitlist — Handoff for the Main Site

**For:** the team building `antitect.org`.
**What:** let visitors register interest in a Capability Development Programme (CDP) without
paying, from its page on the site.
**API status:** built in the CRM (milestone M11, branch `feat/programmes`). Until that is deployed,
build against a local API on that branch (see §9).

This document is self-contained. Everything the site needs for the waitlist is here.

---

## 1. What the feature is

- A CDP is sold in **runs** ("Cohort 1", "Cohort 2"). Each run has its own page at
  `/programmes/[slug]`.
- The team can switch a **waitlist** on for any run, from the CRM. While it is on, visitors can
  leave their details to show interest. **No payment, no place held.**
- The waitlist can be on **alongside paid enrolment** or **instead of it**. A run can take
  waitlist sign-ups **before it is ready to sell**, with its price and dates still to be
  confirmed.
- Joining sends the person a confirmation email. Everything after that (reminders, early-bird
  offers, launch announcements) is sent by the team from the CRM. **The site sends nothing and
  shows nobody who else is waiting.**
- **Interest belongs to the programme, not the run.** Somebody who joins from one run's page is
  waiting for whichever run comes next. Enrolling in any run takes them off the list.

---

## 2. What the site builds

1. The **buttons** on `/programmes/[slug]`, decided by two flags (§4).
2. The **waitlist form** and its **confirmation view** (§7).
3. **Draft pages**: a run taking sign-ups before it is ready to sell, with details "to be
   confirmed" (§5).
4. **Listing**: waitlist runs on `/programmes` and in the landing page programme spotlight (§6).
5. **Closed runs** that point visitors to the next run's waitlist (§8).

Design, tokens and copy tone follow the existing site spec. Nothing here changes them.

---

## 3. The fields

Every programme response gains **`waitlistOpen`**. That covers the detail (`GET /api/public/programs/:slug`),
each item in the list (`GET /api/public/programs`), and the `nextRun` object.

```json
{
  "title": "AI Automation Applied",
  "slug": "ai-automation-applied",
  "phase": "enrolling",
  "enrollmentOpen": true,
  "waitlistOpen": true,
  "priceKobo": 10000000,
  "startsAt": "2026-11-02T09:00:00.000Z",
  "runLabel": "Cohort 1",
  "nextRun": null
}
```

(Abridged. Every field the programme response already returns is still there, unchanged.)

| Field | Meaning |
|---|---|
| `enrollmentOpen` | A place can be bought now. Unchanged. |
| `waitlistOpen` | **New.** The run takes waitlist sign-ups now. |
| `phase` | `enrolling`, `running`, `finished`, and **new: `draft`** (§5). Never `cancelled`; a cancelled run is a 404. |
| `nextRun.waitlistOpen` | **New.** Whether the run that `nextRun` points to takes waitlist sign-ups (§8). |

---

## 4. The buttons

**Decide from `enrollmentOpen` and `waitlistOpen` together**, never from `phase` alone.

| `enrollmentOpen` | `waitlistOpen` | Show |
|---|---|---|
| true | true | **"Secure your spot"** as the main button, and **"Show interest"** beside it as the lesser one |
| true | false | "Secure your spot" only |
| false | true | **"Join waitlist"** only |
| false | false | "Enrolment has closed", with `nextRun` or the community signup (§8) |

- "Show interest" and "Join waitlist" open **the same form** and post to **the same endpoint**.
  Only the wording differs.
- "Secure your spot" is the existing paid enrolment flow. Nothing about it changes.
- A run that is **full** has `enrollmentOpen: false`. With the waitlist on, it shows "Join waitlist".
  That is intended: a full run's waitlist catches people for the next one.
- A run that is **running or finished** with its waitlist on shows "Enrolment for Cohort 1 has
  closed" **and** "Join waitlist", worded as interest in the next run.

---

## 5. Draft pages: details to be confirmed

The team can put a run up for sign-ups before it is ready to sell. The API serves it like any
other run, with:

- `phase: "draft"`
- `enrollmentOpen: false`
- `waitlistOpen: true`

So the page shows "Join waitlist" only, and **`/quote` and `/enroll` answer 404 for it**. Never
offer payment for a draft, whatever else the page shows.

A draft always has a **title, summary and image**. Anything else may not be settled yet:

| Field | Unsettled value | Show |
|---|---|---|
| `startsAt` | `null` | "Dates to be confirmed" |
| `priceKobo` | `0` | "Price to be confirmed". **Never "Free"**: a programme is never free |
| `durationWeeks`, `sessionsPerWeek`, `hoursPerSession` | `null` | Leave the line out |
| `runLabel` | `""` | Leave it out |
| `enrollmentClosesAt`, `capacity`, `spotsRemaining` | `null`, or a number | Leave them out either way. A draft has no closing date or places to show yet |
| `schedule`, `projects`, `outcomes` | `[]` | Leave the section out |
| `faq` | `[]` | The site's standing programme questions, as for any run |

- What a draft shows is a **copy** the team puts on the site deliberately and updates when they
  choose. It can lag behind what they are drafting in the CRM. That is intended; show it as it
  comes.
- A draft's **slug is fixed** once it is on the site, so links to it can be shared safely.
- When the team **publishes** the run, the same slug starts answering as a normal run
  (`phase: "enrolling"`, a price, dates), usually with `enrollmentOpen: true`. Nothing on the
  site needs to change for that; the flags drive it.

---

## 6. The list and the spotlight

`GET /api/public/programs` returns:

1. **Runs open for enrolment first**, soonest start first, exactly as before. Full runs stay
   listed with `isFull: true`.
2. **Then runs taking waitlist sign-ups and nothing else**: drafts with details to be confirmed,
   and closed runs with their waitlist on. Dated runs come before undated ones.

Consequences for the site:

- The landing page spotlight takes `items[0]`. That is **always something a visitor can buy when
  there is one**, and a waitlist-only run otherwise.
- **List cards need the same rules as the page**: the §4 buttons or labels, and the §5
  "to be confirmed" wording for drafts.
- Two runs of the same programme can appear at once, if the team has the waitlist on for both.
  They are warned about this in the CRM. Show them as they come.

---

## 7. Joining

### Request

```
POST /api/public/programs/:slug/waitlist
Content-Type: application/json

{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "phone": "08012345678",
  "state": "Lagos",
  "country": "Nigeria",
  "whatsappOptIn": true
}
```

**These are the same person fields as event registration and community signup, with the same
rules:**

- `firstName` is required, 1–120 characters. `lastName` is optional.
- **`email` and `phone` are both required.** Each missing one comes back as its own field in
  `details`, so mark both at once.
- **Label the phone field as the WhatsApp number.** The team sends waitlist announcements on
  WhatsApp as well as email.
- `phone` is free text:
  - A Nigerian number can be local (`08012345678`).
  - Any other number needs its country code (`+233241234567`).
  - A number the API cannot place comes back as `VALIDATION_ERROR` on `phone`.
- **Where they are**, both optional:
  - Somebody in Nigeria: `state` is one of the 36 states or `FCT`, and `country` is `"Nigeria"`.
  - Anybody else: `country` as typed, up to 80 characters, and no `state` key.
  - A state that is not on the list, or a Nigerian state with another country, is
    `VALIDATION_ERROR` on `state`.
- `whatsappOptIn` is optional. Send `true` from a consent checkbox if you show one.
- **Say on the form** that updates about the programme may come by email or WhatsApp, and that
  replying STOP on WhatsApp stops them. WhatsApp announcements reach everybody on the list with a
  phone number until they reply STOP.

### Responses: all three are success

| Status | Body | Show |
|---|---|---|
| `201` | `{ "alreadyOnWaitlist": false, "alreadyEnrolled": false, "channel": "email", "sentTo": "a***@example.com" }` | **"You're on the waitlist for {title}. We've sent a confirmation to {sentTo}."** |
| `200` | `{ "alreadyOnWaitlist": true, "alreadyEnrolled": false, "channel": "email", "sentTo": "a***@example.com" }` | **"You're already on the waitlist for {title}. We'll be in touch."** Nothing new was sent, so do not say "check your inbox". |
| `200` | `{ "alreadyOnWaitlist": false, "alreadyEnrolled": true, "channel": "email", "sentTo": "a***@example.com" }` | **"You already have a place on {title}."** Nothing was sent. |

- Show the confirmation view in place of the form. **Never an error, and never a payment step.**
- `sentTo` is masked on purpose. Show it as given; never expect a full address.
- `channel` is always `email` today.
- They are on the list for the **programme**. If they joined from Cohort 2's page, they still
  hear about whichever run comes next.

### What the email they receive says

So the site's wording matches. The subject is **"You're on the waitlist for {title}"**:

> Hi {first name}, thanks for your interest in {title}. You're on the waitlist.
>
> {title} · Starts {date} *or* Dates to be confirmed · {length} · {weekly time}
>
> *If enrolment was open when they joined:* Enrolment is open now. If you're ready, you can secure
> your spot today. If not, we'll keep you posted. **[Secure your spot]**
>
> *Otherwise:* We'll be in touch as soon as the dates are confirmed and enrolment opens.
> **[See the programme]**

Both buttons link to the programme's page on the site, `/programmes/{slug}`.

### Errors

The error body is the usual one: `{ "error": { "message", "code", "details"? } }`.

| Code | Status | When | Do |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | A field is wrong | Put each message in `details` on its field |
| `PROGRAM_NOT_FOUND` | 404 | The run is cancelled, or it is a draft whose waitlist was switched off | Say the programme is no longer taking sign-ups, and reload |
| `WAITLIST_CLOSED` | 409 | A published run whose waitlist was switched off | Say sign-ups have closed, reload the programme and redraw the buttons |
| `CONTACT_CONFLICT` | 409 | The email and the phone number belong to two different people the team already knows | Ask them to use one or the other, or contact the team |
| `RATE_LIMITED` | 429 | Too many submissions from this address | Ask them to try again later |

`PROGRAM_NOT_FOUND` and `WAITLIST_CLOSED` on submit mean the page was rendered before the team
switched the waitlist off. With `revalidate: 60` that window is short, but it happens.

### Posting and limits

- **Post from the browser**, as with registration. Submissions share registration's limit of
  **10 per hour per IP**, together with registration, checkout, enrolment and community signup.
  Posting from the server would spend that allowance for every visitor at once.
- The API accepts browser requests from its `MAIN_SITE_URL` only, an exact origin match, scheme
  and all. The CRM team sets it to `https://antitect.org`. Until they do, server-side reads work
  but the browser POST fails on CORS.
- Reads stay on the server with `revalidate: 60`, as for every other programme page.

---

## 8. Closed runs and `nextRun`

A run that is running or finished keeps its page, so links already shared keep working.

`nextRun` points to **the run of the same programme now taking enrolments**. With none enrolling,
it now points to **one taking waitlist sign-ups** instead, which may be a draft with details to be
confirmed:

```json
"nextRun": { "slug": "ai-automation-applied-2", "runLabel": "Cohort 2", "startsAt": null, "waitlistOpen": true }
```

| This run | `nextRun` | Show |
|---|---|---|
| Closed, waitlist off | not null, `waitlistOpen: false` | "Enrolment for Cohort 1 has closed" and a link: "Cohort 2 is open for enrolment" |
| Closed, waitlist off | not null, `waitlistOpen: true` | "Enrolment for Cohort 1 has closed" and a link: "Join the waitlist for the next run" |
| Closed, waitlist off | `null` | "Enrolment has closed", and the community signup |
| Closed, waitlist **on** | anything | "Enrolment for Cohort 1 has closed" and "Join waitlist" right here (§4); a link to `nextRun` too, if there is one |

`nextRun.startsAt` and `nextRun.runLabel` follow the §5 rules: `null` and `""` mean not settled
yet.

---

## 9. Testing against a local API

The CRM runs with no API keys: email prints to the API's console instead of sending, and nothing
is paid for real.

1. Run the CRM API and admin portal from `antitect-crm` on the `feat/programmes` branch.
2. In the admin portal, create a programme with a title and summary, upload an image, and switch
   **Waitlist** on in its header. That is a draft taking sign-ups. Its page is served at
   `GET /api/public/programs/{slug}` with `phase: "draft"`.
3. Submit the form. The confirmation email appears in the API's console.
4. To see both buttons, publish a run with a price and start date, and switch its waitlist on.
5. To see `WAITLIST_CLOSED`, switch a published run's waitlist off and submit a page rendered
   before you did.

### Done when

- [ ] Each of the four flag combinations in §4 shows the right buttons, on the page and on list
      cards.
- [ ] A draft page shows "Dates to be confirmed" and "Price to be confirmed", never "Free", and no
      payment.
- [ ] Joining shows the right confirmation for `201`, `alreadyOnWaitlist` and `alreadyEnrolled`.
- [ ] A missing email and phone are both marked at once.
- [ ] `WAITLIST_CLOSED` and `PROGRAM_NOT_FOUND` on submit reload into the right state.
- [ ] A closed run points to the next run's waitlist when that is all there is.
- [ ] The form posts from the browser, and a real submission from a phone delivers the email.
