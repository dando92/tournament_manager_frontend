export const DIVISION_TABS = [
  { key: "phases", label: "Phases" },
  { key: "players", label: "Players" },
  { key: "standings", label: "Standings" },
] as const;

export type DivisionTabKey = (typeof DIVISION_TABS)[number]["key"];
