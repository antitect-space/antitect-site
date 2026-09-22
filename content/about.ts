/**
 * About Antitect.
 *
 * The continental framing lives here and nowhere else: "across Africa" is the
 * ambition, while Nigeria and Lagos are what people actually search for, so
 * the rest of the site says those.
 */
export const about = {
  headline: "Learning should lead to the ability to do.",
  lead: "Antitect builds practical AI capability across Africa, starting in Lagos.",
  body: [
    "Most AI learning ends with notes and nothing built. Antitect runs the other way round: you start with a project, learn what it needs, and an instructor reviews your work until it does the job.",
    "We run free webinars, hands-on workshops, and multi-week programmes with a weekly one-to-one review. The first workshop filled a room in Lagos in August 2026.",
  ],
} as const;

export interface TeamMember {
  name: string;
  role: string;
  /** A real photograph of this person. Never a workshop photo standing in for a portrait. */
  photo: string;
  bio: string;
}

/**
 * TODO(content): the people who run Antitect — real names, roles, one line
 * each, and real portraits. Nothing is invented here, so the section stays
 * off the page until this list is filled in.
 */
export const team: TeamMember[] = [];
