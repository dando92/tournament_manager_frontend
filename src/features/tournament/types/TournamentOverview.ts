import { PhaseGroup } from "@/features/division/types/PhaseGroup";
import { Entrant } from "@/features/entrant/types/Entrant";

export interface TournamentOverviewPlayer {
  id: number;
  playerName: string;
}

export interface TournamentOverviewPhase {
  id: number;
  name: string;
  type: "pool" | "bracket";
  matchCount: number;
  phaseGroups: PhaseGroup[];
}

export interface TournamentOverviewDivision {
  id: number;
  name: string;
  entrants: Entrant[];
  phases: TournamentOverviewPhase[];
}

export interface TournamentOverview {
  divisionCount: number;
  playerCount: number;
  matchCount: number;
  divisions: TournamentOverviewDivision[];
}
