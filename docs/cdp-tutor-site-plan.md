# Tutor Area — Plan for the Main Site

**Repository:** the main site (`antitect.org`, Next.js). Not this one.
**Companion:** `docs/cdp-learner-site-plan.md`, which this follows in shape and in rules.
**The CRM half:** M10 in `docs/implementation-plan.md`, which builds every endpoint named here.

The site now has two kinds of account: a **learner**, who takes a programme, and a **tutor**, who
teaches one. Separate collections, separate sign-ins, separate sessions — two doors, not one door
with two keys.

---

## 1. Why the tutor area exists, and what it is not

A tutor needs to review work, and until now that meant a CRM admin account carrying contacts,
payments, broadcasts and every programme Antitect runs. This area gives a tutor their own runs and
nothing else, so an external tutor can be engaged without handing over the business.

**It is not a second CRM.** A tutor cannot schedule or move a session, see a payment, enrol anybody,
issue a certificate, open a run they do not teach, or send anything. Those stay with the super admin
in the CRM. When something here seems to need one of them, it is a question for the CRM side, not a
page to build.

| Tutor does | Admin does, in the CRM |
|---|---|
| Review work and give feedback | Set and reschedule sessions |
| Mark who attended | Upload recordings and paste the link |
| Keep project resources current | Payments, enrolments, refunds |
| Read their schedule and roster | Completion and certificates |
| | Assign a tutor to a run, which invites them |
| | **Every announcement, notice and message somebody composes** |

**There is no compose box anywhere in the tutor area.** The only messages a tutor's actions produce
are the approval and the revision request, which the API sends when a decision is recorded, written
as feedback on a piece of work. A rescheduling notice comes from the admin moving the session; the
API already sends it. If a tutor needs to tell a cohort something, the team sends it from the CRM,
and the screen should say so rather than pretending otherwise.

---

## 2. Accounts and routing

Learners and tutors live in different collections, with different signing keys and different
cookies. A tutor session is not a learner session in another hat: it cannot open `/learn`, and a
learner session cannot open `/teach`. **Access to a run comes from teaching it, exactly as a
learner's comes from being enrolled** — signing in is not entitlement on either side.

- `/learn/*` — the learner area, as built, on the learner cookie.
- `/teach/*` — the tutor area, its own route group, **never cached**, rendered per request, on the
  tutor cookie. Same server-side API calls and the same first-party cookie handling as `/learn`.
- **Its own sign-in at `/teach/login`**, posting to the tutor auth endpoints. Not a shared form and
  not a redirect by role.
- Invitation, forgotten password and reset work exactly as the learner ones do: same 410
  `TOKEN_EXPIRED` behaviour, same single resend button with no email field, same password rules.
- A tutor arrives by invitation only. There is no sign-up: an admin assigns them to a programme in
  the CRM, and that sends the link.

**A person may be both**, and then they hold two accounts, possibly on the same email address, with
two passwords and two sessions. Do not try to merge them or offer a switcher between the two areas:
they are separate logins. A link from one to the other is fine.

**403 means the same thing it means in the learner area:** signed in, but this is not yours. Say so
and stay put. Never redirect a 403 to the login form.

---

## 3. The API contract

Base `/api/tutor/*`, on the tutor cookie, guarded by the tutor collection's own strategy. Every
route naming a programme also checks that this tutor teaches it. Errors are the usual
`{ error: { message, code, details? } }`. Times are ISO UTC; display them in `Africa/Lagos` and name
the zone.

```
POST  /api/tutor/auth/login            { email, password }  → sets the tutor cookie
POST  /api/tutor/auth/accept-invite    { token, password }  → sets it
POST  /api/tutor/auth/forgot           { email }  → always 200
POST  /api/tutor/auth/reset            { token, password }
POST  /api/tutor/auth/resend-invite    { token }
POST  /api/tutor/auth/logout

GET   /api/tutor/me
GET   /api/tutor/programs                          the runs they teach
GET   /api/tutor/programs/:id                      the run: next session, waiting review, progress
GET   /api/tutor/programs/:id/sessions             read-only
GET   /api/tutor/programs/:id/roster               names, progress, attendance — never money
PUT   /api/tutor/sessions/:id/attendance           bulk, their own sessions
GET   /api/tutor/submissions?programId=&status=    the queue, oldest first
GET   /api/tutor/submissions/:id                   work, brief, every previous version
POST  /api/tutor/submissions/:id/start-review
POST  /api/tutor/submissions/:id/decision          { decision, feedback }
GET   /api/tutor/programs/:id/resources
POST  /api/tutor/programs/:id/resources            program- and project-scoped only
PATCH /api/tutor/resources/:id
DELETE /api/tutor/resources/:id
```

There is no send endpoint, and there will not be one.

**The review queue is the whole job.** `GET /submissions` returns each waiting submission with the
learner's name, the run, the project, the links, the notes, whether it was late, and how long it has
been waiting. `GET /submissions/:id` adds the brief and requirements — so the standard and the work
are read side by side — and every earlier version with the feedback it got.

**A decision is `{ decision: "approve" | "request_revision", feedback }`.** Approving opens the
learner's next project and emails them naming it; requesting a revision emails them the feedback.
Both are handled by the API — the tutor area does not send anything itself.

**`start-review` claims a submission** so two reviewers do not write over each other. Call it when a
tutor opens one, not when they decide.

**Attendance never affects progression.** Say so on the screen if it helps, and never present it as
something a learner can fail.

---

## 4. Pages

Mobile matters less here than in the learner area — reviewing is desk work — but the schedule and
attendance will be opened on a phone during or just after a session, so those two must work there.

| Route | Holds |
|---|---|
| `/teach` | **Dashboard.** What is waiting review, with the oldest first; the next session with its join link; anything overdue. One question: what needs me now? |
| `/teach/review` | The queue across their runs, oldest first, filterable by run. |
| `/teach/review/[id]` | **The review screen.** The work's links, the learner's notes, the brief and requirements beside them, previous versions and their feedback, a feedback box, and two buttons: Approve, Request revision. |
| `/teach/programmes/[id]` | One run: schedule, roster with progress, resources. |
| `/teach/programmes/[id]/schedule` | Sessions by week, read-only, each with "Mark attendance". |
| `/teach/programmes/[id]/attendance/[sessionId]` | The cohort as a list, present / late / absent / excused, saved in one go. |
| `/teach/programmes/[id]/resources` | Add, edit, reorder and remove project and programme resources, with release dates. |

**Optimise the review screen for speed.** It is the thing a tutor does most and the thing a cohort
waits on. Opening the work should take one click from the dashboard, and deciding should take one
more. Keyboard shortcuts for approve and request-revision would earn their keep.

**One-on-one requests are in Cal.com**, not here. The run's page shows the booking link learners use
and a button through to the tutor's Cal.com dashboard, where the bookings actually live. Do not
build a bookings list: nothing in this API has that data, by decision.

---

## 5. What the tutor area must never do

- Send anything, or offer a box to compose anything in. Announcements, notices and messages to a
  cohort all come from the CRM.
- Show a payment, a price, a discount code or a refund.
- Show a run the tutor does not teach, or a learner not on one of their runs.
- Create, move, cancel or delete a session, or touch a recording link.
- Enrol, remove or complete anybody, or issue a certificate.
- Offer a way to sign up. Tutors arrive by invitation from the CRM.
- Store anything of its own. As in the learner area, the API is the only source of truth.

If a tutor asks for one of these, it is a CRM job, and the honest answer on screen is that the team
handles it.

---

## 6. Build order

The API side of each step lands first; ask the CRM session before starting one.

| Step | Build | After CRM |
|---|---|---|
| **T1** | `/teach` sign-in, invitation and reset, the route group, the dashboard shell | M10-1 |
| **T2** | The review queue and the review screen | M10-2 |
| **T3** | Run page, schedule, roster | M10-3 |
| **T4** | Attendance | M10-4 |
| **T5** | Resources, and the Cal.com links | M10-5 |

T2 is the one a cohort waits on. Everything after it is improvement; T2 is the difference between a
programme that runs and one that does not.
