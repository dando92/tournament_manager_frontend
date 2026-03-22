import axios from "axios";
import { Account } from "@/features/player/types/Account";
import { Tournament } from "@/features/tournament/types/Tournament";

export async function fetchHelpers(tournamentId: number): Promise<Account[]> {
  const response = await axios.get<Tournament>(`tournaments/${tournamentId}`);
  return (response.data as Tournament & { helpers: Account[] }).helpers ?? [];
}

export async function addHelper(tournamentId: number, accountId: string): Promise<Tournament> {
  const response = await axios.post<Tournament>(`tournaments/${tournamentId}/helpers`, { accountId });
  return response.data;
}

export async function removeHelper(tournamentId: number, accountId: string): Promise<Tournament> {
  const response = await axios.delete<Tournament>(`tournaments/${tournamentId}/helpers/${accountId}`);
  return response.data;
}

export async function fetchHelperCandidates(): Promise<Account[]> {
  const response = await axios.get<Account[]>("user");
  return response.data;
}
