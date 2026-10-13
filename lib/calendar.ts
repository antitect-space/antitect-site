/**
 * "Add to Google Calendar" after a registration: Google's own template link,
 * filled from the event's public fields. It never carries the joining link,
 * which only goes out with the reminders.
 *
 * Times go in as UTC instants, so the calendar shows them in whatever zone the
 * person keeps it in. Without an end time the entry starts and ends at the
 * same moment: the site never invents a length.
 */
export function googleCalendarUrl({
  title,
  startsAt,
  endsAt,
  details,
  location,
}: {
  title: string;
  startsAt: string;
  endsAt: string | null;
  details: string;
  location: string;
}): string {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const dates = `${stamp(start)}/${stamp(end && end > start ? end : start)}`;

  const params = new URLSearchParams({ action: "TEMPLATE", text: title, dates, details, location });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** 20261017T090000Z */
function stamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
