import { TEACH } from "./area";
import { areaRead } from "./area-api";

/**
 * What the tutor area reads. The reading itself is `area-api`, shared with the
 * learner side; this is the contract for the tutor half of the API.
 *
 * Only `/me` is built so far. The rest arrives with the review queue, which is
 * the step a cohort actually waits on, and those shapes are not written here
 * ahead of the endpoints that return them.
 */

export interface Tutor {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

export async function getTutor(): Promise<Tutor> {
  const { tutor } = await areaRead<{ tutor: Tutor }>(TEACH, "/me");
  return tutor;
}
