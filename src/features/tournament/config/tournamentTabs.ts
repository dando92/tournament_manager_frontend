export const TOURNAMENT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "divisions", label: "Divisions" },
  { key: "songs", label: "Songs" },
  { key: "live", label: "Live" },
  { key: "stats", label: "Stats" },
] as const;

export type TournamentTabKey = (typeof TOURNAMENT_TABS)[number]["key"];
