import { Player } from "./Player";
import { Round } from "./Round";

export interface Match {
  id: number;
  name: string;
  subtitle: string;
  notes: string;
  scoringSystem: string;
  players: Player[];
  rounds: Round[];
}
