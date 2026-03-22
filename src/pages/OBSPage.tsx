import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import LiveScores from "@/features/live/components/LiveScores";
import { useScoreHub, TournamentLobbyStateDto } from "@/features/live/services/useScoreHub";

export default function OBSPage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const [lobbyState, setLobbyState] = useState<TournamentLobbyStateDto | null>(null);

  const handleLobbyState = useCallback(
    (data: TournamentLobbyStateDto) => {
      if (data.lobbyId === lobbyId && data.players?.length > 0) {
        setLobbyState(data);
      }
    },
    [lobbyId],
  );

  const handleLobbyDisconnected = useCallback(
    (_tournamentId: number, disconnectedLobbyId: string) => {
      if (disconnectedLobbyId === lobbyId) setLobbyState(null);
    },
    [lobbyId],
  );

  useScoreHub(handleLobbyState, handleLobbyDisconnected);

  return (
    <div className="min-h-screen bg-transparent p-4">
      {lobbyState ? (
        <LiveScores lobbyState={lobbyState} />
      ) : (
        <p className="text-white text-lg">Waiting for live scores…</p>
      )}
    </div>
  );
}
