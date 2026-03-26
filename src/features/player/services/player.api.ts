import axios from "axios";
import { Player } from "@/features/player/types/Player";

export async function bulkAddToDivision(
  divisionId: number,
  playerNames: string[],
): Promise<{ players: Player[]; warnings: string[] }> {
  const response = await axios.post<{ players: Player[]; warnings: string[] }>(
    `divisions/${divisionId}/players/bulk`,
    { playerNames },
  );
  return response.data;
}

export async function removeFromDivision(divisionId: number, playerId: number): Promise<void> {
  await axios.delete(`divisions/${divisionId}/players/${playerId}`);
}
