export interface TournamentDivisionOptionPhase {
  id: number;
  name: string;
  matchCount: number;
}

export interface TournamentDivisionOption {
  id: number;
  name: string;
  players: { id: number; playerName: string }[];
  phases: TournamentDivisionOptionPhase[];
}
