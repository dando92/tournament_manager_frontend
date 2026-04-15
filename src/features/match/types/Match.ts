import { Entrant } from "@/features/entrant/types/Entrant";
import { Round } from "@/features/match/types/Round";

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
  phaseId?: number;
}
