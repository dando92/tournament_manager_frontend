import { Match } from "@/features/match/types/Match";

export interface Phase {
  id: number;
  name: string;
  matches?: Match[];
  matchCount?: number;
}
