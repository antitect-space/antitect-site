# CDP Delivery — Build Spec

**Phase:** Learner delivery for Capability Development Programmes
**First programme:** AI Automation Applied
**Applies to two repositories.** Section 13 says which sections each coding agent reads.

---

## 1. Context

Antitect can now sell a programme: the public site takes enrolments, Paystack takes payment, and the CRM sends email and WhatsApp. It cannot yet *deliver* one. There is nowhere for a learner to log in, see their schedule or submit work, and nowhere for the team to run a cohort.

This phase builds that delivery layer, based on the AI Automation Applied programme document:

- Cohorts of 10, one instructor each, six weeks
- Three live sessions a week — Tuesday and Thursday 7–9pm, Saturday 10am–12pm WAT
- One 30-minute one-to-one project review per learner per week
- Six projects, one per week, the last one independent
- Progression by approved projects, not attendance
- A digital certificate on completion

**The schedule and projects in that document are marked *proposed*.** Everything here must be editable in the CRM. Nothing about sessions, projects, prices, dates or durations is hardcoded.

### One programme record is one run

**There is no separate cohort model.** Each programme record in the CRM is a single run — what the programme document calls a cohort. To run the next cohort, the team duplicates the previous record and edits it. The CRM already supports duplication; this phase extends it (§3.9).

So "AI Automation Applied — Cohort 1" and "AI Automation Applied — Cohort 2" are two programme records. Wherever this spec says *programme*, it means one run.

### Where things live

| Layer | Owns |
|---|---|
| **API** | All data, business rules, access control, notifications. Single source of truth. |
| **CRM** (`admin.antitect.org`) | Running each programme: schedule, projects, resources, review, attendance, completion |
| **Main site** (`antitect.org`) | The learner area at `/learn`, and the public certificate verification page |

---

## 2. Decisions already taken

| Decision | Detail |
|---|---|
| **One programme record per run** | New cohorts are made by duplicating. Enrolments stay attached to the programme record. No migration. |
| **Projects: all visible, submitted in order** | Every project is visible from day one so learners can follow the live sessions. Project N can only be submitted once project N−1 is approved. |
| **Late work is accepted and flagged** | Deadlines exist and late submissions are marked late, but never blocked. Blocking would strand a learner who fell behind. |
| **1:1 review booking uses Cal.com** | Not built. The instructor manages availability in Cal.com; the dashboard links to it. See §10.1. |
| **Live sessions use Google Meet** | One recurring Meet link per run, overridable per session. |
| **Sessions are recorded in Google Meet and published to YouTube** | Unlisted videos, linked from the session. Never uploaded to Antitect's own storage. See §10.2. |
| **Shareable files live on Google Drive** | Briefs, templates, slides and guides are Drive links. **The API stores no files in this phase.** See §10.3. |
| **Submissions are links only** | A Loom demo, a link to the working workflow, and a Drive link for anything else. No file uploads. |
| **Instructor uses an admin account for cohort 1** | Acceptable only if the instructor is on the founding team. If an external instructor is engaged, stop and add a scoped instructor role first. |
| **Learner and admin accounts are separate** | Different collections, different login, different token secret. A learner token must never pass an admin check. |

---

## 3. Data model — API

Code identifiers keep the existing `program` spelling. Prose uses "programme."

### 3.1 `programs` — extended

The existing record gains the fields a run needs:

| Field | Notes |
|---|---|
| `runLabel` | "Cohort 1", "Cohort 2". Distinguishes runs of the same programme in CRM lists, audience pickers, emails and certificates — otherwise five identical titles appear side by side. |
| `seriesSlug` | Links every run of the same programme, e.g. `ai-automation-applied`. **Set automatically when duplicating** — copied from the source. See §6.3 for why it matters. |
| `startsOn` | date |
| `durationWeeks` | e.g. 6 |
| `capacity` | 10 — existing capacity enforcement stays as it is |
| `price`, `currency` | existing |
| `status` | `draft` · `enrolling` · `active` · `completed` · `cancelled` — extends the existing statuses |
| `instructorUserId` | ref → admin `users` |
| `meetUrl` | recurring Google Meet link |
| `bookingUrl` | Cal.com link for project reviews |
| `weeklyPattern` | array of `{ day, startTime, endTime, title }` in WAT — the Tue/Thu/Sat pattern |
| `timezone` | `Africa/Lagos` |
| `certificateEnabled` | boolean |

Map the existing `published` state to `enrolling`. Only `enrolling` accepts new enrolments.

### 3.2 `enrollments` — extended

Stays attached to the programme. **No migration.** Add:

| Field | Notes |
|---|---|
| `status` | `pending_payment` · `paid` · `active` · `completed` · `withdrawn` |
| `completedAt` | set when marked complete |
| `certificateName` | the name the learner confirms for their certificate |

### 3.3 `learners` — new

Separate from admin `users`.

| Field | Notes |
|---|---|
| `contactId` | ref, unique — the learner **is** a contact, so the CRM shows one history per person |
| `email` | lowercased, unique |
| `passwordHash` | bcrypt, cost 12 |
| `status` | `invited` · `active` · `disabled` |
| `calendarFeedToken` | random secret for the calendar subscription (§6.1) |
| `lastLoginAt` | |

### 3.4 `authTokens` — new

Used for both invitations and password resets.

| Field | Notes |
|---|---|
| `learnerId` | ref |
| `purpose` | `invite` · `reset` |
| `tokenHash` | **store the hash, never the token** |
| `expiresAt` | invite: 7 days · reset: 1 hour |
| `usedAt` | single use |

### 3.5 `sessions` — new

| Field | Notes |
|---|---|
| `programId` | ref |
| `week` | 1–6 |
| `title` | from the pattern, editable |
| `startsAt`, `endsAt` | stored UTC |
| `joinUrl` | defaults to the programme's `meetUrl` |
| `recordingUrl` | the unlisted YouTube link, added after the session |
| `status` | `scheduled` · `cancelled` · `completed` |

### 3.6 `projects` — new

Belong to one programme record. Each run has its own copy, so one cohort's projects can be adjusted without affecting another.

| Field | Notes |
|---|---|
| `programId` | ref |
| `order` | 1–6 |
| `title` | |
| `whatYoullBuild`, `whatYoullGain` | from the programme document |
| `week` | |
| `brief`, `requirements`, `submissionGuidelines` | Markdown |
| `deadlineOffsetDays` | days from `startsOn`, e.g. week 1 → 7 |

**Deadline** = `startsOn` + `deadlineOffsetDays`, end of that day WAT. Storing an offset rather than a date means a duplicated programme with a new start date gets correct deadlines automatically.

### 3.7 `resources` — new

| Field | Notes |
|---|---|
| `programId` | ref |
| `scope` | `project` · `session` · `program` |
| `projectId` / `sessionId` | whichever the scope needs |
| `type` | `brief` · `material` · `template` · `guide` · `reference` · `slides` |
| `title` | |
| `url` | a Google Drive link, or any other link |
| `releaseAt` | optional — hidden from learners until then |
| `order` | |

### 3.8 `submissions` — new

**One document per version.** A revision creates a new document, so the full history of work and feedback is preserved.

| Field | Notes |
|---|---|
| `enrollmentId`, `projectId` | refs |
| `version` | 1, 2, 3… |
| `links` | array of `{ label, url }` — e.g. demo, workflow |
| `notes` | learner's description |
| `status` | `submitted` · `under_review` · `revision_required` · `approved` |
| `isLate` | set at submission against the deadline |
| `submittedAt`, `reviewStartedAt`, `reviewedAt` | |
| `reviewerId` | ref → `users` |
| `feedback` | Markdown |

### 3.9 Duplication — extended

The existing duplicate action must learn about the new records. When a programme is duplicated:

**Copied** — into the new draft as starting values. Every copied value is fully editable and independent of the source: editing the draft never changes the run it was copied from, and nothing is locked because it came from a copy.

- Programme details, `durationWeeks`, `weeklyPattern`, `capacity`, `price`, `instructorUserId`, `meetUrl`, `bookingUrl`, `certificateEnabled`
- `seriesSlug` — copied unchanged, which is what links the runs
- Every project, with its brief, requirements, guidelines and deadline offset — as **new project records** belonging to the draft, not references to the source's projects
- Every `project`- and `program`-scoped resource — as **new resource records** carrying the same Drive links, nothing re-uploaded

**The registration URL is never copied.** It is generated automatically for the new run, exactly as for a brand-new programme, and must never be the source run's URL. Links already shared for the previous cohort have to keep pointing at the previous cohort — its page handles closed enrolment and links forward (§6.3).

**Not copied** — these belong to a single run

- Sessions — regenerated from the new start date
- `session`-scoped resources — and recordings, which belong to sessions
- Enrolments, submissions, attendance, certificates

**Reset on the copy**

- `status` → `draft`
- `startsOn` → empty, so it must be set before sessions can be generated
- `runLabel` → empty, so it must be set before publishing
- `slug` → a new unique slug


### 3.10 `attendance` — new

`sessionId`, `enrollmentId`, `status` (`present` · `late` · `absent` · `excused`), `markedBy`, `markedAt`. Unique on `(sessionId, enrollmentId)`. Recorded for insight only — **it never affects progression.**

### 3.11 `certificates` — new

| Field | Notes |
|---|---|
| `enrollmentId` | ref, unique |
| `number` | human-readable, e.g. `ANT-AAA-2026-0001` |
| `verificationCode` | random, unguessable, used in the public URL |
| `name` | from `enrollments.certificateName` |
| `programTitle`, `runLabel`, `completedOn` | copied at issue time, so later edits don't change an issued certificate |
| `issuedAt`, `revokedAt` | |

### 3.12 `messages` and `broadcasts` — small additions

- `messages`: add `sessionId` and `submissionId` refs alongside the existing `eventId`, so session reminders can be found and cancelled when a session changes.
- `broadcasts.audience`: add `enrolledInProgramIds`, so the team can send an announcement to one run's learners.

Both are additive.

---

## 4. Access and files

**Learner authentication**

- Passport gains a second strategy, `learner-jwt`, reading the token from an **httpOnly cookie** — not a header, and not local storage. The learner area is public-facing; an httpOnly cookie can't be read by injected scripts.
- Cookie: `Domain=.antitect.org`, `Secure`, `SameSite=Lax`, `HttpOnly`, 7-day expiry.
- Signed with `LEARNER_JWT_SECRET`, **different from** the admin `JWT_SECRET`. That is the guarantee a learner token can never pass the admin guard.
- Load the learner from the database on every request, as the admin guard does, so a disabled learner loses access immediately.
- CORS: `https://antitect.org` allowed **with credentials** on `/api/learner/*`.

**Every learner endpoint checks enrolment**, not just login. Being logged in doesn't entitle a learner to another programme's schedule or files.

**Files live outside the API.** Resources are Google Drive links and recordings are unlisted YouTube links. The API stores no files in this phase — no upload endpoint, no storage bucket, no signed URLs.

**What the API still controls is when a link is revealed.** A resource's `url` is returned only to learners with an active enrolment in that programme, and only once its `releaseAt` has passed. Before that the resource may be listed by title, but the link is withheld. Never return a `url` early, in any response.

**Once revealed, a link can be shared.** Anyone given a Drive or unlisted YouTube link can open it. That is the accepted trade-off of this approach — for a cohort of ten, the value is in the live sessions and the reviews, not the files. §10.3 covers tighter Drive sharing if it's ever needed.

---

## 5. Business rules

### 5.1 Invitation

1. The Paystack webhook confirms payment → enrolment `paid`.
2. If the contact has no learner account: create one as `invited`, create an `invite` token, send the invitation email.
3. If the learner already has an active account (a returning learner, say from cohort 1 into another programme): no invitation — send "You're enrolled in [programme]. Log in to see your schedule."
4. Accepting the invitation sets the password, marks the learner `active` and the enrolment `active`, and logs them in.
5. **Expired invite link:** show a page offering to send a fresh link to the email address already on file. Never accept an email address typed on that page — that would let anyone probe which addresses are enrolled.
6. The CRM can resend an invitation at any time. Resending invalidates earlier tokens.

**Timing lever:** if the learner area isn't ready when enrolment opens, invitations can be held and sent in one batch a week before the programme starts. The enrolment confirmation then says when login details will arrive. Use this only if the schedule demands it.

### 5.2 Sessions and reminders

- **Generate:** from the programme's `weeklyPattern`, create every session for `durationWeeks` weeks from `startsOn`. Tue/Thu/Sat × 6 = 18 sessions. Requires `startsOn` to be set.
- **On create:** schedule 24-hour and 1-hour reminders for every `active` enrolment, through the existing `sendMessage()` with `sessionId` set.
- **On time change:** cancel that session's pending reminders, recreate them, and send a "session moved" notice.
- **On cancel:** cancel pending reminders and send a cancellation notice.
- **Late enrolment:** reminders are scheduled for future sessions only.
- All times are stored in UTC, displayed in WAT with the timezone named.

### 5.3 Projects and progression

- Every project is visible to every active enrolment from the start.
- Project 1 can be submitted at any time. Project N can be submitted only after project N−1 has an `approved` submission.
- The derived "In progress" state means the project is open for submission and has nothing submitted yet.
- After submitting, the learner can't edit. They wait for a decision.
- Decision `revision_required`: the learner submits a new version. Decision `approved`: the next project opens.
- Submissions after the deadline are accepted and marked `isLate`.

```
in progress → submitted → under review → approved → next project opens
                                       ↘ revision required → submitted (next version)
```

### 5.4 Completion and certificates

- **Mark complete** is enabled once all required projects are approved. The admin confirms the capability demonstration — the final project — and marks the enrolment `completed`.
- Before a certificate is issued, the learner confirms the name exactly as it should appear. Names in contact records are often nicknames or incomplete.
- Issuing creates the certificate record and sends the learner a link.
- Certificates can be revoked. A revoked certificate still verifies, but shows as revoked.

---

## 6. API endpoints

### 6.1 Learner (`/api/learner/*`, learner cookie, enrolment checked)

```
POST /auth/accept-invite        { token, password }  → sets cookie
POST /auth/login                { email, password }  → sets cookie
POST /auth/logout
POST /auth/forgot               { email }  → always 200, never reveals whether the email exists
POST /auth/reset                { token, password }
POST /auth/resend-invite        { token }  → sends a new link to the email on file

GET  /me
GET  /enrollments                          every programme the learner is enrolled in
GET  /programs/:id                         overview, next session, progress, booking link
GET  /programs/:id/sessions
GET  /programs/:id/projects                with status per project
GET  /programs/:id/projects/:projectId     brief, resources, full submission history and feedback
POST /programs/:id/projects/:projectId/submissions
PATCH /enrollments/:id/certificate-name
GET  /enrollments/:id/certificate
```

**Calendar feed:** `GET /api/learner/calendar/:calendarFeedToken.ics` — authenticated by the learner's secret token in the URL rather than the cookie, because calendar apps can't send cookies. Returns every session in the learner's active enrolments. It's a **subscription**, so moved and cancelled sessions update in the learner's calendar on their own. Google Calendar refreshes subscribed feeds slowly — sometimes hours — so reminders still carry the urgent changes.

### 6.2 Admin (`/api/*`, admin guard)

```
Programmes                           existing CRUD, extended fields
POST /programs/:id/duplicate         extended per §3.9
Projects, resources                  CRUD — resources are links
POST /programs/:id/sessions/generate
Sessions                             CRUD
GET  /programs/:id/roster
POST /enrollments/:id/resend-invite
PUT  /sessions/:id/attendance        bulk
GET  /submissions?status=&programId= the review queue
POST /submissions/:id/start-review
POST /submissions/:id/decision       { decision, feedback }
POST /enrollments/:id/complete
POST /enrollments/:id/certificate
POST /certificates/:id/revoke
```

### 6.3 Public — additive changes only

The existing enrolment endpoints need no change.

**Closed runs must not 404.** Today a programme page is only served while published. Under this model, once Cohort 1 closes enrolment its page would disappear — and every link to it already shared on WhatsApp would break. So:

- `GET /api/public/programs/:slug` returns a run that is `enrolling`, `active` or `completed`. It still 404s for `draft` and `cancelled`.
- The response gains `status`, `runLabel`, and `nextRun` — the slug, label and start date of the newest `enrolling` run with the same `seriesSlug`, or null.
- The site shows a closed run as *"Enrolment for [runLabel] has closed"*, with a link to `nextRun` when there is one.
- The public programmes list shows `enrolling` runs only.

New endpoint:

- `GET /api/public/certificates/:verificationCode` → name, programme, run label, completion date, and valid or revoked.

The main site depends on existing response shapes. Add fields; never rename or remove them.

---

## 7. Notifications

Every notification goes through the existing `sendMessage()`, is `category: transactional` (so unsubscribing from broadcasts never blocks it), and names WAT in any time.

| Template | Channels | Trigger |
|---|---|---|
| `learner_invitation` | **Email only** — it contains a login link | Payment confirmed, new learner |
| `enrollment_returning` | Email, WhatsApp | Payment confirmed, existing learner |
| `password_reset` | **Email only** | Forgot password |
| `program_welcome` | Email | One week before start: dates, schedule, how to join, how to book reviews |
| `session_reminder_24h`, `session_reminder_1h` | Email, WhatsApp | Scheduled |
| `session_changed`, `session_cancelled` | Email, WhatsApp | Admin edit |
| `submission_received` | Email | Learner submits |
| `submission_awaiting_review` | Email, to the instructor | Learner submits |
| `project_revision_required` | Email, WhatsApp | Decision |
| `project_approved` | Email, WhatsApp | Decision — names the project that's now open |
| `deadline_reminder` | Email, WhatsApp | 24h before a deadline, if nothing is submitted |
| `certificate_issued` | Email | Issue |

**Submit the WhatsApp versions to Meta for approval at the start of this phase.** Approval takes time, and templates can't be edited once approved.

---

## 8. CRM screens

**Programme list** — shows `runLabel` and `startsOn` beside each title, so runs of the same programme are distinguishable at a glance. Filter by status.

**Programme detail** — tabs:

| Tab | Contents |
|---|---|
| **Overview** | Title, run label, dates, capacity, price, instructor, status, Meet link, booking link, weekly pattern |
| **Roster** | Each learner: payment status, account status (invited/active), progress out of 6, attendance rate, "Resend invite" |
| **Schedule** | "Generate sessions" from the pattern; every session listed by week; edit time, cancel, paste the YouTube recording link; mark attendance per session |
| **Projects** | Each project's brief, requirements, guidelines, deadline offset — with the resulting date shown — and its resources |
| **Resources** | Programme- and session-level Drive links, with release dates |
| **Announcements** | Broadcast to this run's learners |
| **Completion** | Who has every project approved; mark complete; issue certificates |

**Duplicate** — after duplicating, open the new record with the fields that need attention highlighted: run label, start date, and status still `draft`.

**Review queue** — across all programmes, oldest submitted first. The review screen shows the project brief and requirements beside the submission links and previous versions' feedback, with a feedback field and two actions: **Approve** and **Request revision**. This is the instructor's most frequent task. Optimise it for speed.

**Contact detail** — gains enrolments, learner account status, submissions and attendance, so one page shows everything about a person.

---

## 9. Learner area — main site

A section of the existing Next.js app at `/learn`, in its **own route group**: protected by middleware, **never cached**, fetching per request with the learner's cookie forwarded to the API. It must not change how the marketing pages are cached.

Mobile first. Learners will mostly check their schedule and next session on a phone.

| Route | Contents |
|---|---|
| `/learn/login` | Email and password |
| `/learn/invite/[token]` | Set password. Expired → offer to resend to the email on file |
| `/learn/forgot`, `/learn/reset/[token]` | Password reset |
| `/learn` | **Dashboard:** next session with a relative label and a join button; the current project, its deadline and status; progress 1–6; the most recent feedback; "Book your project review" |
| `/learn/schedule` | Sessions grouped by week, join links, recordings for past sessions, "Add to calendar" (subscribes to the feed) |
| `/learn/projects` | All six projects with status: in progress, submitted, under review, revision required, approved, or waiting on the previous project |
| `/learn/projects/[id]` | Brief, requirements, resources, the submission form (links and notes), and the full version history with feedback |
| `/learn/certificate` | Confirm certificate name, then download once issued |
| `/verify/[code]` | **Public.** Certificate verification |

If a learner is enrolled in more than one programme, show a switcher. Default to the active one.

**The dashboard's job is one answer: what do I do next?** Lead with the next session and the current project. Everything else is secondary.

Use the site's existing brand system — tokens, the cut-from-the-mark geometry, the ticket treatment for sessions. The learner area is part of the same product.

**Public programme pages** also change slightly — see §6.3: a closed run shows that enrolment has closed and links to the next run.

---

## 10. External tools

Three tools do work this phase deliberately doesn't build. None of them needs code beyond storing and showing a link — but each has a setup requirement worth checking before cohort 1.

### 10.1 Cal.com — project review booking

The instructor creates a 30-minute event type and manages availability in Cal.com.

- The programme's `bookingUrl` is shown on the dashboard, **prefilled with the learner's name and email** through Cal.com's `name` and `email` URL parameters, so they don't retype them.
- **Connect the instructor's Google Calendar to Cal.com** and set Google Meet as the event location. Each booking then gets its own Meet link and lands in the instructor's calendar automatically.
- Cal.com's free plan covers a single instructor.
- One review per learner per week is a guideline for cohort 1, managed by the instructor. Cal.com can't enforce a per-person weekly limit.
- Syncing bookings back into the CRM is out of scope. The instructor sees bookings in Cal.com.

### 10.2 Google Meet and YouTube — live sessions and recordings

**Workflow, per session:**

1. The session runs on the programme's recurring Meet link.
2. The host records it in Google Meet. The recording saves to the host's Google Drive, in *Meet Recordings*.
3. Download it and upload it to YouTube as **unlisted** — not public, and not private.
4. Paste the YouTube link into the session's recording field in the CRM. It then appears on the learner's schedule.

**Why unlisted:** private YouTube videos must be shared with each viewer's Google account one video at a time — eighteen sessions times ten learners per cohort. Unlisted works for anyone with the link, which is the same trade-off already accepted for Drive.

**Why YouTube rather than the Drive recording:** YouTube adjusts video quality to the connection, which matters for learners on mobile data, and plays reliably in phone browsers.

**Two setup requirements to check before cohort 1:**

- **Google Meet recording needs Google Workspace Business Standard or higher**, and only the host can record. It isn't available on free Gmail or on Business Starter. If the account hosting sessions isn't on an eligible plan, either upgrade that account or record with a screen recorder such as OBS on the host's machine — the recording goes to YouTube either way.
- **The YouTube channel must be verified** to upload videos longer than 15 minutes. Two-hour sessions will fail to upload otherwise. Verification is by phone and takes minutes; do it before the first session, not after it.

Recordings also count against the Workspace account's Drive storage, so delete them from Drive once they're on YouTube.

### 10.3 Google Drive — shareable files

Briefs, templates, slides, guides and reference material live in Google Drive. The CRM stores each as a link on a resource.

- **Share files as "Anyone with the link — Viewer."** Learners shouldn't need a Google account to open a brief.
- **For templates learners must edit, use a copy link.** Replace the end of a Google Docs or Sheets link — `/edit…` — with `/copy`. Opening it asks the learner to make their own copy, instead of letting them edit the original that every other learner uses.
- **Organise one folder per programme run**, with a subfolder per project. Duplicating a programme in the CRM reuses the same links, so shared material only has to be uploaded once.
- **If tighter control is ever needed:** share the run's folder with a Google Group and add each enrolled learner's Google account to it. Links then only open for enrolled learners — at the cost of requiring every learner to have and sign in with a Google account. Not needed for cohort 1.

---

## 11. Build order

The cohort 1 start date is **not yet set**. Each milestone states the point in the learner's journey by which it must work. Once the date is set, count back from it.

| # | Milestone | Needed by | Done when |
|---|---|---|---|
| **L1** | Programme run fields. Learner accounts: invitation on payment, accept, login, logout, reset. CRM roster and resend | When the first learner pays — or a week before start, using the batch lever in §5.1 | A test payment produces an invitation email; accepting it logs the learner in to an empty dashboard; a learner token is rejected by an admin route |
| **L2** | Sessions: generate, edit, cancel, reminders, calendar feed. CRM schedule tab. Dashboard and schedule pages | A week before start | Generating creates 18 sessions; moving one reschedules its reminders; the feed shows every session in Google Calendar |
| **L3** | Projects and resources. CRM project and resource management. Learner project pages | First session | A learner can open project 1 and its brief's Drive link; a resource with a future release date shows its title but not its link; a learner not enrolled is refused |
| **L4** | Submissions, review queue, decisions, progression, notifications | End of week 1 | Submit → review → request revision → resubmit → approve opens project 2; every step notifies the right person |
| **L5** | Attendance, booking link on the dashboard, programme announcements | End of week 1 | Attendance marked for a session appears on the roster; an announcement reaches only that run's learners |
| **L6** | Completion, certificate name confirmation, certificates, public verification | Week 5 | A completed learner confirms their name, receives a certificate, and its verification page shows it as valid |
| **L7** | Duplication copies projects, resources and pattern per §3.9; closed runs link to the next run per §6.3 | **Before cohort 2 opens** | Duplicating cohort 1 produces a draft with every project and resource and no enrolments or sessions; the draft has its own registration URL, not cohort 1's; editing a copied project in the draft leaves cohort 1's project unchanged; cohort 1's public page, once closed, links to cohort 2 |

Certificates come late because nobody needs one until week 6. Duplication comes last because nothing needs it until the second cohort.

---

## 12. Out of scope

- A separate cohort model — each programme record is one run
- Building booking — Cal.com covers it
- Paid extra one-to-one sessions
- Hosting video — YouTube covers it
- Storing files — Google Drive covers it
- Automatic attendance from Google Meet
- A separate instructor role — unless an external instructor is engaged (§2)
- Syncing bookings into the CRM
- Discussion, chat or community features in the learner area — the community lives on WhatsApp
- Quizzes, grades or scores
- More than one instructor per programme run

If a task seems to need any of these, stop and ask.

---

## 13. Which agent reads what

**CRM repository (API + CRM portal):** sections 1–8, 10, 11, 12 and 14. Everything except the learner-area UI.

**Site repository:** sections 1, 2, 4 (the authentication and CORS parts), 5.1 and 5.3 (the rules the UI must reflect), 6.1 and 6.3 (the contract it calls, including closed-run pages), 9, 11 and 14.

Build the API side of each milestone before the site side. The site can't build against endpoints that don't exist yet.

---

## 14. Rules for agents

- The API is the only source of truth. Neither the CRM nor the site stores learner data of its own.
- Each programme record is one run. Do not introduce a separate cohort collection.
- Learner and admin authentication stay separate: different collections, different secrets, different guards.
- Every learner endpoint checks enrolment, not just login.
- The API stores no files in this phase. Resources and recordings are links.
- Never return a resource's link before its `releaseAt`, or to a learner not enrolled in that programme.
- Public API changes are additive only.
- Never hardcode sessions, projects, prices, dates or durations. The programme document marks them as proposed.
- Store times in UTC. Display them in WAT, with the timezone named.
- Every notification goes through `sendMessage()`. No provider SDK outside `providers/`.
- Invitation and reset tokens are stored hashed, single use, and expiring.
- Do not build booking, video hosting or any item in §12.
- Do not add dependencies without asking — certificate PDF generation in particular. Propose an approach first.
