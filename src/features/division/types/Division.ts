import { Phase } from "@/features/division/types/Phase";
import { Player } from "@/features/player/types/Player";

export interface Division {
  id: number;
  name: string;
  phases: Phase[];
  players: Player[];
  playersPerMatch: number | null;
  seeding: number[] | null;
}
