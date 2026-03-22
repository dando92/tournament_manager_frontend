import { Player } from "@/features/player/types/Player";
import { Round } from "@/features/match/types/Round";

export interface Match {
  id: number;
  name: string;
  subtitle: string;
  notes: string;
  scoringSystem: string;
  players: Player[];
  rounds: Round[];
  targetPaths: number[];
  sourcePaths: number[];
  phaseId?: number;
}
