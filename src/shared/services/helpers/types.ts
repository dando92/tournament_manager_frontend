export interface HelperAccount {
  id: string;
  username: string;
}

export interface TournamentHelpersResponse {
  id: number;
  name: string;
  syncstartUrl?: string;
  helpers: HelperAccount[];
}
