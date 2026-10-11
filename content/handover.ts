import type { StatusIcon, StatusTone } from "@/components/handover/status-label";

/**
 * The handover cards (design section 05): a job as it is done today, and the
 * same job handed over to AI. Each is a small working demo of one task, so
 * its contents are an example business's (a shoe seller's WhatsApp, a
 * creator's notes), never Antitect's own figures.
 *
 * Every card plays through numbered steps, from the design's storyboards.
 * `from` is the step something appears at, `until` the step it gives way at;
 * left out, it is there throughout. Without JavaScript, and with reduced
 * motion, a card shows its last step.
 */

export interface Stepped {
  text: string;
  from?: number;
  until?: number;
}

export interface Status {
  tone: StatusTone;
  icon: StatusIcon;
  label: string;
}

/*
 * Every card also has a `description`, read out in place of the card (which
 * is drawn for the eye only), a `caption`, and `times`: when each step begins,
 * in ms from the start, the last being the end.
 */

const WAITING: Status = { tone: "neutral", icon: "clock", label: "Waiting" };

// ---------------------------------------------------------------------------
// The hero's card: answering customer enquiries. Steps: start, arrow, Tunde,
// Amaka, Kelechi, end (about 2.8s, on load).
// ---------------------------------------------------------------------------

export const enquiries = {
  description:
    "An example: 47 unread WhatsApp enquiries to a shop. With AI, 44 are answered on their own, and the 3 that need a person, such as a custom order, are flagged for you.",
  caption: "Example build: answering customer enquiries on WhatsApp",
  times: [0, 300, 700, 1250, 1800, 2800],
  today: {
    summary: "WhatsApp · 47 unread",
    messages: [
      { name: "Tunde", time: "9:14 pm", text: "Do you have the black one in size 42?", mark: "tick", at: 2 },
      { name: "Amaka", time: "10:02 pm", text: "How much is delivery to Ikeja?", mark: "tick", at: 3 },
      { name: "Kelechi", time: "10:40 pm", text: "Can you make it in brown? I need 6 pairs.", mark: "flag", at: 4 },
    ],
    footer: [
      { text: "44 more unread", until: 2 },
      { text: "36 more unread", from: 2, until: 3 },
      { text: "20 more unread", from: 3, until: 4 },
      { text: "5 more unread", from: 4, until: 5 },
      { text: "All read", from: 5 },
    ],
  },
  withAi: {
    summary: [
      { text: "0 answered · 0 need you", until: 2 },
      { text: "8 answered · 0 need you", from: 2, until: 3 },
      { text: "24 answered · 1 need you", from: 3, until: 4 },
      { text: "39 answered · 2 need you", from: 4, until: 5 },
      { text: "47 answered · 3 need you", from: 5 },
    ],
    items: [
      {
        who: "To Tunde",
        result: "Size 42 in black: in stock, ₦38,500",
        at: 2,
        before: WAITING,
        after: { tone: "done", icon: "tick", label: "Answered" },
      },
      {
        who: "To Amaka",
        result: "Delivery to Ikeja: ₦2,500, 1–2 days",
        at: 3,
        before: WAITING,
        after: { tone: "done", icon: "tick", label: "Answered" },
      },
      {
        who: "From Kelechi",
        result: "Custom order request",
        at: 4,
        before: WAITING,
        after: { tone: "attention", icon: "flag", label: "Flagged for you" },
      },
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// The four in "What you'll be able to do", each taught in a programme.
// ---------------------------------------------------------------------------

export interface Task {
  title: string;
  who: string;
  /** The programme that teaches it, by its title in the CRM. */
  taughtIn: string;
}

/** Sort new leads. Steps: start, arrow, Adaeze, Femi, Zainab, Ifeanyi, end. */
export const leads = {
  task: { title: "Sort new leads", who: "For business owners", taughtIn: "AI Automation Applied" },
  description:
    "An example: 86 new sign-ups from Instagram, waiting to be read one by one. With AI, they are sorted into 14 ready to buy, 31 to follow up and 41 not a fit.",
  caption: "Example build",
  // The storyboard's steps are 400ms apart; held to 450 here, the brief's least.
  times: [0, 300, 700, 1150, 1600, 2050, 3200],
  today: {
    summary: "86 new sign-ups from Instagram",
    people: [
      { name: "Adaeze", text: "How much for the full set?", at: 2 },
      { name: "Femi", text: "Do you ship to Port Harcourt?", at: 3 },
      { name: "Zainab", text: "Just browsing, thanks", at: 4 },
      { name: "Ifeanyi", text: "Can I pay in instalments?", at: 5 },
    ],
    footer: [
      { text: "82 more, not sorted", until: 2 },
      { text: "61 more, not sorted", from: 2, until: 3 },
      { text: "40 more, not sorted", from: 3, until: 4 },
      { text: "19 more, not sorted", from: 4, until: 5 },
      { text: "All sorted", from: 5 },
    ],
  },
  withAi: {
    summary: [
      { text: "Sorting 86 sign-ups", until: 6 },
      { text: "14 ready to buy · 31 to follow up · 41 not a fit", from: 6 },
    ],
    groups: [
      {
        before: { tone: "neutral", icon: "dash", label: "Ready to buy" },
        after: { tone: "done", icon: "tick", label: "Ready to buy" },
        at: 2,
        count: [
          { text: "0", until: 2 },
          { text: "7", from: 2, until: 5 },
          { text: "14", from: 5 },
        ],
        chips: [
          { name: "Adaeze", tone: "done", at: 2 },
          { name: "Ifeanyi", tone: "done", at: 5 },
        ],
      },
      {
        before: { tone: "neutral", icon: "dash", label: "To follow up" },
        after: { tone: "attention", icon: "clock", label: "To follow up" },
        at: 3,
        count: [
          { text: "0", until: 3 },
          { text: "16", from: 3, until: 5 },
          { text: "31", from: 5 },
        ],
        chips: [{ name: "Femi", tone: "attention", at: 3 }],
      },
      {
        before: { tone: "neutral", icon: "dash", label: "Not a fit" },
        after: null,
        at: 0,
        count: [
          { text: "0", until: 4 },
          { text: "21", from: 4, until: 5 },
          { text: "41", from: 5 },
        ],
        chips: [{ name: "Zainab", tone: "neutral", at: 4 }],
      },
    ],
  },
} as const;

/** Follow up every lead. Steps: start, arrow, Chidi, Ngozi, Emeka, reply, end. */
export const followups = {
  task: { title: "Follow up every lead", who: "For sales", taughtIn: "AI Automation Applied" },
  description:
    "An example: three follow-ups due, one of them two days late. With AI, each is sent on time, and the replies come back: Ngozi says yes to an order of 200.",
  caption: "Example build",
  times: [0, 300, 700, 1250, 1800, 2400, 3400],
  today: {
    summary: "Reminders",
    reminders: [
      { task: "Call Chidi back", due: "2 days late", at: 2 },
      { task: "Send Ngozi the price list", due: "Due today", at: 3 },
      { task: "Chase Emeka’s quote", due: "Due today", at: 4 },
    ],
    footer: [
      { text: "3 due", until: 2 },
      { text: "2 due", from: 2, until: 3 },
      { text: "1 due", from: 3, until: 4 },
      { text: "Nothing due", from: 4 },
    ],
  },
  withAi: {
    summary: [
      { text: "0 sent · 0 replies", until: 2 },
      { text: "1 sent · 0 replies", from: 2, until: 3 },
      { text: "2 sent · 0 replies", from: 3, until: 4 },
      { text: "3 sent · 0 replies", from: 4, until: 5 },
      { text: "3 sent · 4 replies", from: 5, until: 6 },
      { text: "Follow-ups sent on time · 4 replies", from: 6 },
    ],
    reply: { label: "Reply", text: "Ngozi replied: Yes, let’s go ahead with 200.", at: 5 },
    sent: [
      { task: "Call Chidi back", at: 2 },
      { task: "Send Ngozi the price list", at: 3 },
      { task: "Chase Emeka’s quote", at: 4 },
    ],
    before: { tone: "attention", icon: "clock", label: "Due" } satisfies Status,
    after: { tone: "done", icon: "tick", label: "Sent · 9:00 am" } satisfies Status,
  },
} as const;

/** Match payments to orders. Steps: start, arrow, three checks, paid, receipt, end. */
export const payments = {
  task: { title: "Match payments to orders", who: "For operations", taughtIn: "AI Automation Applied" },
  description:
    "An example: a bank alert for ₦45,000 to be matched against open orders by hand. With AI, it is checked against the orders, matched to order 1042, marked paid, and a receipt is sent.",
  caption: "Example build",
  times: [0, 300, 700, 1150, 1600, 2200, 2800, 3600],
  alert: { label: "Bank alert", text: "₦45,000 from A. Okafor" },
  orders: [
    { number: "1041", customer: "Musa", amount: "₦12,000", paid: true },
    { number: "1042", customer: "Okafor", amount: "₦45,000", paid: false, paidAt: 5 },
    { number: "1043", customer: "Ibrahim", amount: "₦8,500", paid: false },
  ],
  today: {
    summary: "Payments to match",
    matchedAt: 5,
    footer: [
      { text: "1 payment unmatched", until: 5 },
      { text: "All payments matched", from: 5 },
    ],
  },
  withAi: {
    summary: [
      { text: "Checking 1 payment", until: 2 },
      { text: "1 of 3 checks passed", from: 2, until: 3 },
      { text: "2 of 3 checks passed", from: 3, until: 4 },
      { text: "3 of 3 checks passed", from: 4, until: 5 },
      { text: "Matched to order 1042 · Marked paid", from: 5, until: 7 },
      { text: "Matched to order 1042 · Marked paid · Receipt sent", from: 7 },
    ],
    checks: [
      { text: "Amount matches an order", at: 2 },
      { text: "Name matches the customer", at: 3 },
      { text: "Order is still unpaid", at: 4 },
    ],
    receipt: { text: "Receipt sent to A. Okafor", at: 6 },
  },
} as const;

/** Turn an idea into a video plan. Steps: start, arrow, research, script, titles, checklist, end. */
export const video = {
  task: { title: "Turn an idea into a video plan", who: "For creators", taughtIn: "AI Automation Applied" },
  description:
    "An example: a one-line video idea in a blank note. With AI, it becomes a plan ready to record: research, a script outline, title options and a publishing checklist.",
  caption: "Example build",
  times: [0, 300, 700, 1250, 1800, 2400, 3400],
  today: {
    summary: "Notes",
    idea: "Video idea: 5 ways to price your services",
    plannedAt: 5,
    footer: [
      { text: "4 sections to write", until: 2 },
      { text: "3 to write", from: 2, until: 3 },
      { text: "2 to write", from: 3, until: 4 },
      { text: "1 to write", from: 4, until: 5 },
      { text: "Nothing left to write", from: 5 },
    ],
  },
  withAi: {
    before: { tone: "neutral", icon: "clock", label: "Drafting" } satisfies Status,
    after: { tone: "done", icon: "tick", label: "Ready to record" } satisfies Status,
    readyAt: 6,
    sections: [
      { heading: "Research", at: 2, lines: ["What clients in your field charge", "Why clients say yes to a price"] },
      {
        heading: "Script outline",
        at: 3,
        lines: ["Hook: the quote that lost a client", "Five ways, one example each", "Close: update your rates today"],
      },
      { heading: "Title options", at: 4, lines: ["Stop undercharging: 5 pricing fixes", "How to price your services well"] },
    ],
    checklist: { heading: "Publishing checklist", at: 5, items: ["Thumbnail", "Description", "Tags"] },
  },
} as const;

/** "What you'll be able to do", in the design's order. */
export const tasksSection = {
  title: "Work you can hand over to AI.",
  intro: "Real tasks from real jobs. Each one is a system you can learn to build yourself.",
} as const;
