import { Player } from "@/models/Player";
import { Round } from "@/models/Round";

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
