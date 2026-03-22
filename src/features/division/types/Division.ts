import { Match } from "@/features/match/types/Match";
import { Phase } from "@/features/division/types/Phase";
import { Player } from "@/features/player/types/Player";

export interface Division {
  id: number;
  name: string;
  matches: Match[];
  phases: Phase[];
  players: Player[];
  playersPerMatch: number | null;
}
