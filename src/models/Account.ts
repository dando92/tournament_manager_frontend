export interface Account {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isTournamentCreator: boolean;
  grooveStatsApi?: string;
  nationality?: string;
  profilePicture?: string;
  player?: { id: number; playerName: string };
}
