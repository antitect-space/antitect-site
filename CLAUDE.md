@AGENTS.md

## Redesign

The site is being rebuilt from the pen.dev design `antitect-redesign-v2.pen`
(read it through the pencil MCP server; never edit it). `redesign` is the
integration branch; each page is built on its own `redesign-<page>` branch off
it and squash-merged back through a pull request. `main` stays deployable: it
takes real payments.

Decided for every page:

- Body text is **Public Sans**, headings **Newsreader**, the logo wordmark
  Archivo 800. Schibsted Grotesk was considered and has no naira sign (₦).
- `/learn` and `/teach` keep Archivo and their current look until they get a
  redesign of their own. Their fonts are scoped, so global changes do not reach
  them.

Rules:

1. The design file is the source of truth for looks. Use its variables and
   components. Where something in the design breaks a rule below, the rule
   wins, and say so.
2. `lib/api.ts` stays the only code that calls the API. Do not change the API
   contract or its caching. Small helpers, such as filtering events by type,
   are fine.
3. Figures come only from the CRM. Dates, times, prices, places, cohort labels
   and statuses are never written into copy. If a figure is missing, leave its
   sentence out. Never put a price in metadata or link-preview images.
4. Sample data is sample data. Values in the design's "Sample data" frames show
   layout, not content.
5. Placeholders never ship. Anything in square brackets in the design, such as
   "[N] people" or a quote still to be collected, does not render. Put the copy
   in `content/` with a `TODO(content)` marker, and hide the element until it is
   filled in.
6. Red is for action only. At most one red button per screen. No red
   decoration, and no red text on ink.
7. Status colours (green, amber and grey) appear only on the task cards'
   status labels.
8. Keep `/learn` and `/teach` working. Check both after any global style
   change.
9. Wording: British spelling, sentence case, and "capability development
   programme" in full, never "CDP". Use "place", never "spot".
10. Location: Abuja appears only in the footer. "Lagos" stays out of the site
    description and metadata, and appears only where it names an event's
    venue.
11. Performance: most visitors use phones on mobile data, often inside
    WhatsApp's in-app browser. Use `next/image` for images and lazy-load
    anything below the fold. Ship no JavaScript a page does not need: the FAQ
    and the mobile menu are native `<details>`.
12. Accessibility: tap targets of at least 44px, visible focus rings, 4.5:1
    text contrast. The H1 is the largest text on the page. Everything that
    moves has a reduced-motion state.
13. Dependencies: use what is in `package.json`. Ask before adding anything. No
    animation libraries.
14. Git: one commit per task, prefixed `feat:`, `fix:`, `chore:` or `docs:`.
    Run `npm run lint` and `npm run typecheck` before each commit. Commit
    locally and ask before pushing.

### Webinar, workshop and programme pages

These add to the rules above.

15. Times are always West Africa Time: in full on detail pages ("10:00 am –
    12:00 pm West Africa Time"), and as "WAT" on cards. Use `lib/format.ts`.
16. Show a length only when there is an end time.
17. Never promise WhatsApp delivery. The confirmation goes by email, and the
    joining link comes with the reminders. The joining link never appears on
    any page.
18. One red button per screen, counting the mobile register bar. On detail
    pages the community band's button is ink.
19. Wording: "Secure your place" and "Reserve your place", never "spot";
    "capability development programme" in full; the webinars or workshops
    page, never "the events page".
20. The weekly review and the learning loop appear only on programme pages.
21. Flyers are never cropped, in any shape, and every fact on a flyer also
    appears as text on the page.
22. Recordings load only when someone taps play, from YouTube's
    privacy-enhanced domain (`youtube-nocookie.com`).
23. No invented proof: no instructor, host or testimonial sections.
    Unconfirmed answers are hidden, with a `TODO(content)` marker.
24. Form logic stays as it is (`components/forms/`, `lib/form-errors.ts`):
    forms never clear on failure, repeats are harmless, and slow connections
    get a note. Only how they look, and the wording the design gives, change.
25. Caching stays as `lib/api.ts` has it: server reads cached for 60 seconds,
    and anything that depends on the current time decided in the browser, as
    `components/live.tsx` does.
