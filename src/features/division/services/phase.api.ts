import axios from "axios";

export async function updatePhaseSeeding(phaseId: number, entrantIds: number[]): Promise<void> {
  await axios.patch(`phases/${phaseId}/entrant-seeding`, { entrantIds });
}
