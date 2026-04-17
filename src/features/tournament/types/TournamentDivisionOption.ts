import { PhaseGroup } from "@/features/division/types/PhaseGroup";
import { Entrant } from "@/features/entrant/types/Entrant";

export interface TournamentDivisionOptionPhase {
  id: number;
  name: string;
  type: "pool" | "bracket";
  matchCount: number;
  phaseGroups: PhaseGroup[];
}

export interface TournamentDivisionOption {
  id: number;
  name: string;
  entrants: Entrant[];
  phases: TournamentDivisionOptionPhase[];
}
