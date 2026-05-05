import { Entrant } from "@/features/entrant/types/Entrant";

export interface TournamentDivisionOptionPhase {
  id: number;
  name: string;
  matchCount: number;
}

export interface TournamentDivisionOption {
  id: number;
  name: string;
  playersPerMatch: number | null;
  entrants: Entrant[];
  phases: TournamentDivisionOptionPhase[];
}
