import axios from "axios";
import { Player } from "@/features/player/types/Player";

export async function updateDivisionSeeding(divisionId: number, seeding: number[]): Promise<void> {
  await axios.patch(`divisions/${divisionId}`, { seeding });
}

export async function getAllPlayers(): Promise<Player[]> {
  const response = await axios.get<Player[]>("players");
  return response.data;
}

export async function bulkAddToDivision(
  divisionId: number,
  playerNames: string[],
): Promise<{ players: Player[]; warnings: string[] }> {
  const response = await axios.post<{ players: Player[]; warnings: string[] }>(
    `players/divisions/${divisionId}/bulk`,
    { playerNames },
  );
  return response.data;
}

export async function assignPlayerToDivision(playerId: number, divisionId: number): Promise<void> {
  await axios.post(`players/${playerId}/divisions/${divisionId}`);
}

export async function removeFromDivision(playerId: number, divisionId: number): Promise<void> {
  await axios.delete(`players/${playerId}/divisions/${divisionId}`);
}
