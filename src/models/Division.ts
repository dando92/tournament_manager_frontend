import { Match } from "@/models/Match";
import { Phase } from "@/models/Phase";
import { Player } from "@/models/Player";

export interface Division {
  id: number;
  name: string;
  matches: Match[];
  phases: Phase[];
  players: Player[];
  playersPerMatch: number | null;
}
