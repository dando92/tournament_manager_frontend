import axios from "axios";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { ActiveLobbyDto, LobbyStateDto } from "@/features/live/services/useScoreHub";

type Params = {
  tournamentId: number;
  activeLobbies: ReadonlyMap<string, ActiveLobbyDto>;
  lobbyStates: ReadonlyMap<string, LobbyStateDto>;
};

export function useTournamentLobbiesPage({
  tournamentId,
  activeLobbies,
  lobbyStates,
}: Params) {
  const lobbies = useMemo(() => {
    return Array.from(activeLobbies.values())
      .filter((lobby) => lobby.tournamentId === tournamentId)
      .sort((a, b) => a.lobbyName.localeCompare(b.lobbyName))
      .map((lobby) => ({
        lobby,
        lobbyState: lobbyStates.get(lobby.lobbyId),
      }));
  }, [activeLobbies, lobbyStates, tournamentId]);

  async function handleDisconnectLobby(lobbyId: string) {
    try {
      await axios.delete(`tournaments/${tournamentId}/lobbies/${lobbyId}/disconnect`);
      toast.success("Lobby disconnected.");
    } catch {
      toast.error("Failed to disconnect lobby.");
    }
  }

  return {
    lobbies,
    handleDisconnectLobby,
  };
}
