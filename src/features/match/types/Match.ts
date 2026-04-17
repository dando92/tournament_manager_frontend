import { Entrant } from "@/features/entrant/types/Entrant";
import { Round } from "@/features/match/types/Round";

export interface MatchResultPlayerPoints {
  playerId: number;
  points: number;
}

export interface MatchResult {
  id: number;
  playerPoints: MatchResultPlayerPoints[];
}

export interface Match {
  id: number;
  name: string;
  subtitle: string;
  notes: string;
  scoringSystem: string;
  entrants: Entrant[];
  rounds: Round[];
  targetPaths: number[];
  sourcePaths: number[];
  matchResult?: MatchResult | null;
  phaseId?: number;
}
