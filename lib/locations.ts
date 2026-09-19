/**
 * Where somebody is based. Nigerians pick their state; everybody else picks
 * "Outside Nigeria" and types their country.
 *
 * The values are what the CRM stores and filters on, so they are plain names
 * spelled one way: no "State" suffix, and the capital territory as "FCT".
 */
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

/** The option that swaps the state for a country. */
export const OUTSIDE_NIGERIA = "Outside Nigeria";

/** How a state reads in the list. Only FCT needs help. */
export function stateLabel(state: string): string {
  return state === "FCT" ? "FCT (Abuja)" : state;
}

export function isNigerianState(value: string): boolean {
  return (NIGERIAN_STATES as ReadonlyArray<string>).includes(value);
}
