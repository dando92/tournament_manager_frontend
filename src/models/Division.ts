import { Match } from "@/models/Match";

export interface Division {
  id: number;
  name: string;
  matches: Match[];
  playersPerMatch: number | null;
}
