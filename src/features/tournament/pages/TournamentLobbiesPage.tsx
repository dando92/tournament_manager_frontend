import { Navigate } from "react-router-dom";
import LobbyCardsSection from "@/features/tournament/components/lobbies/LobbyCardsSection";
import { useTournamentPageContext } from "@/features/tournament/context/TournamentPageContext";
import { useTournamentUpdates } from "@/features/tournament/context/TournamentUpdatesContext";
import { useTournamentLobbiesPage } from "@/features/tournament/hooks/useTournamentLobbiesPage";

export default function TournamentLobbiesPage() {
  const { tournamentId, controls } = useTournamentPageContext();
  const { activeLobbies, lobbyStates } = useTournamentUpdates();
  const { lobbies, handleDisconnectLobby } = useTournamentLobbiesPage({
    tournamentId,
    activeLobbies,
    lobbyStates,
  });

  if (!controls) {
    return <Navigate to={`/tournament/${tournamentId}/overview`} replace />;
  }

  return (
    <div className="flex flex-col gap-6">
      <LobbyCardsSection lobbies={lobbies} onDisconnect={handleDisconnectLobby} />
    </div>
  );
}
