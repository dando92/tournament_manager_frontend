import axios from "axios";
import { Account } from "@/features/player/types/Account";
import { TournamentHelpersResponse, HelperAccount } from "@/shared/services/helpers/types";

export async function fetchHelpers(tournamentId: number): Promise<HelperAccount[]> {
  const response = await axios.get<TournamentHelpersResponse>(`tournaments/${tournamentId}`);
  return response.data.staff ?? [];
}

export async function addHelper(tournamentId: number, accountId: string): Promise<TournamentHelpersResponse> {
  const response = await axios.post<TournamentHelpersResponse>(`tournaments/${tournamentId}/helpers`, { accountId });
  return response.data;
}

export async function removeHelper(tournamentId: number, accountId: string): Promise<TournamentHelpersResponse> {
  const response = await axios.delete<TournamentHelpersResponse>(`tournaments/${tournamentId}/helpers/${accountId}`);
  return response.data;
}

export async function fetchHelperCandidates(): Promise<Account[]> {
  const response = await axios.get<Account[]>("user");
  return response.data;
}
