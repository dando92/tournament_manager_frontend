export interface TournamentOverviewPlayer {
  id: number;
  playerName: string;
}

export interface TournamentOverviewPhase {
  id: number;
  name: string;
  matches: { id: number }[];
}

export interface TournamentOverviewDivision {
  id: number;
  name: string;
  players: TournamentOverviewPlayer[];
  phases: TournamentOverviewPhase[];
}

export interface TournamentOverview {
  divisionCount: number;
  playerCount: number;
  matchCount: number;
  divisions: TournamentOverviewDivision[];
}
