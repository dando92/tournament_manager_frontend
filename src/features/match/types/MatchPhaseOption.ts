export interface MatchPhaseOption {
  id: number;
  name: string;
  type: "pool" | "bracket";
  phaseGroups: Array<{
    id: number;
    name: string;
    mode: "set-driven" | "progression-driven";
  }>;
}
