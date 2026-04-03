export const TOURNAMENT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "songs", label: "Songs" },
  { key: "live", label: "Live" },
  { key: "stats", label: "Stats" },
] as const;

export type TournamentTabKey = (typeof TOURNAMENT_TABS)[number]["key"];
