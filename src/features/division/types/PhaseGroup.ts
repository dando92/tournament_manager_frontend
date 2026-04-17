export interface PhaseGroup {
  id: number;
  name: string;
  mode: "set-driven" | "progression-driven";
  matchCount: number;
}
