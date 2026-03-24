export interface CreateMatchRequest {
  phaseId: number;
  divisionId?: number; // only needed for song rolling
  matchName: string;
  subtitle: string;
  scoringSystem: string;
  notes: string;
  group: string;
  levels: string;
  songIds: number[];
  playerIds: number[];
}

export interface AddSongToMatchRequest {
  matchId: number;
  group?: string;
  level?: string;
  songId?: number;
  divisionId?: number;
}

export interface EditSongToMatchRequest {
  matchId: number;
  songId: number;
  group?: string;
  level?: string;
  newSongId?: number;
  divisionId?: number;
}

export interface AddStandingToMatchRequest {
  playerId: number;
  songId: number;
  percentage: number;
  score: number;
  isFailed: boolean;
}
