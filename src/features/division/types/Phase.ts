import { Match } from "@/features/match/types/Match";
import { PhaseGroup } from "@/features/division/types/PhaseGroup";
import { PhaseSeed } from "@/features/division/types/PhaseSeed";

export interface Phase {
  id: number;
  name: string;
  type: "pool" | "bracket";
  matches?: Match[];
  matchCount?: number;
  phaseGroups: PhaseGroup[];
  seeds?: PhaseSeed[];
}
