export function getTournamentHeaderSubtitle(
  pathname: string,
  tournamentId: number,
): string {
  if (pathname === `/tournament/${tournamentId}/overview`) return "Tournament Workspace";
  if (pathname === `/tournament/${tournamentId}/songs`) return "Songs";
  if (pathname === `/tournament/${tournamentId}/lobbies`) return "Manage Syncstart Lobbies";
  if (pathname === `/tournament/${tournamentId}/live`) return "Live";
  if (pathname === `/tournament/${tournamentId}/stats`) return "Statistics";
  return "Tournament Workspace";
}
