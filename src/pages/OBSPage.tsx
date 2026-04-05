import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import LiveScores from "@/features/live/components/LiveScores";
import {
  LiveMatchStateDto,
  LobbyStateDto,
  useScoreHub,
} from "@/features/live/services/useScoreHub";

export default function OBSPage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const [lobbyState, setLobbyState] = useState<LiveMatchStateDto | null>(null);

  const handleLiveMatchState = useCallback(
    (data: LiveMatchStateDto) => {
      if (data.lobbyId === lobbyId && data.players.length > 0) {
        setLobbyState(data);
      }
    },
    [lobbyId],
  );

  const handleLobbyDisconnected = useCallback(
    (_tournamentId: number, disconnectedLobbyId: string) => {
      if (disconnectedLobbyId === lobbyId) {
        setLobbyState(null);
      }
    },
    [lobbyId],
  );

  const handleLobbyState = useCallback(
    (data: LobbyStateDto) => {
      if (
        data.lobbyId === lobbyId &&
        !data.players.some((player) => player.screenName === "ScreenGameplay")
      ) {
        setLobbyState(null);
      }
    },
    [lobbyId],
  );

  useScoreHub(
    handleLiveMatchState,
    handleLobbyDisconnected,
    undefined,
    handleLobbyState,
  );

  return (
    <div className="min-h-screen bg-transparent p-4">
      {lobbyState ? (
        <LiveScores lobbyState={lobbyState} />
      ) : (
        <p className="text-white text-lg">Waiting for live scores...</p>
      )}
    </div>
  );
}
