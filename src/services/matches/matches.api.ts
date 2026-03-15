import axios from "axios";
import { Match } from "@/models/Match";
import { Phase } from "@/models/Phase";
import {
  AddStandingToMatchRequest,
  CreateMatchRequest,
} from "@/models/requests/match-requests";

export async function listByPhase(phaseId: number): Promise<Match[]> {
  try {
    const response = await axios.get<Phase>(`phases/${phaseId}`);
    return response.data.matches ?? [];
  } catch (error) {
    console.error("Error listing matches by phase:", error);
    throw new Error("Unable to list matches by phase.");
  }
}

export async function create(request: CreateMatchRequest): Promise<Match> {
  try {
    const response = await axios.post<Match>("match-operations/matches", {
      matchName: request.matchName,
      subtitle: request.subtitle,
      notes: request.notes,
      phaseId: request.phaseId,
      playerIds: request.playerIds,
      scoringSystem: request.scoringSystem,
      divisionId: request.divisionId,
      group: request.group,
      levels: request.levels,
      songIds: request.songIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating match:", error);
    throw new Error("Unable to create match.");
  }
}

export async function editMatchNotes(
  matchId: number,
  notes: string,
): Promise<string> {
  try {
    const response = await axios.patch<Match>(`matches/${matchId}`, { notes });
    return response.data.notes;
  } catch (error) {
    console.error("Error editing match notes:", error);
    throw new Error("Unable to edit match notes.");
  }
}

export async function deleteMatch(matchId: number): Promise<void> {
  try {
    await axios.delete("matches/" + matchId);
  } catch (error) {
    console.error("Error deleting match:", error);
    throw new Error("Unable to delete match.");
  }
}

export async function addSongToMatch(
  matchId: number,
  songId?: number,
  divisionId?: number,
  group?: string,
  level?: string,
): Promise<Match> {
  try {
    const response = await axios.post<Match>(
      `match-operations/matches/${matchId}/songs`,
      { songId, divisionId, group, level },
    );
    return response.data;
  } catch (error) {
    console.error("Error adding song to match:", error);
    throw new Error("Unable to add song to match.");
  }
}

export async function editSongInMatch(
  matchId: number,
  editSongId: number,
  songId?: number,
  divisionId?: number,
  group?: string,
  level?: string,
): Promise<Match> {
  try {
    const response = await axios.put<Match>(
      `match-operations/matches/${matchId}/songs/${editSongId}`,
      { songId, divisionId, group, level },
    );
    return response.data;
  } catch (error) {
    console.error("Error editing song in match:", error);
    throw new Error("Unable to edit song in match.");
  }
}

export async function addStandingToMatch(
  matchId: number,
  request: AddStandingToMatchRequest,
): Promise<Match> {
  try {
    const response = await axios.post<Match>(
      `match-operations/matches/${matchId}/standings`,
      request,
    );
    return response.data;
  } catch (error) {
    console.error("Error adding standing to match:", error);
    throw new Error("Unable to add standing to match.");
  }
}

export async function editStandingInMatch(
  matchId: number,
  songId: number,
  playerId: number,
  percentage: number,
  score: number,
  isFailed: boolean,
): Promise<Match> {
  try {
    const response = await axios.put<Match>(
      `match-operations/matches/${matchId}/standings`,
      { songId, playerId, percentage, score, isFailed },
    );
    return response.data;
  } catch (error) {
    console.error("Error editing standing in match:", error);
    throw new Error("Unable to edit standing in match.");
  }
}

export async function deleteStandingFromMatch(
  matchId: number,
  playerId: number,
  songId: number,
): Promise<Match> {
  try {
    const response = await axios.delete<Match>(
      `match-operations/matches/${matchId}/standings/${playerId}/${songId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting standing from match:", error);
    throw new Error("Unable to delete standing from match.");
  }
}
