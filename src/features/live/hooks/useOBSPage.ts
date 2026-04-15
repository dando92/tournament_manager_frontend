import { useCallback, useState } from "react";
import {
  LiveMatchStateDto,
  LobbyStateDto,
  useScoreHub,
} from "@/features/live/services/useScoreHub";

export function useOBSPage(lobbyId?: string) {
  const [liveMatchState, setLiveMatchState] = useState<LiveMatchStateDto | null>(null);
  const [lobbyState, setLobbyState] = useState<LobbyStateDto | null>(null);
  const [displayLobbyState, setDisplayLobbyState] = useState<LobbyStateDto | null>(null);

  const handleLiveMatchState = useCallback(
    (data: LiveMatchStateDto) => {
      if (data.lobbyId === lobbyId && data.players.length > 0) {
        setLiveMatchState(data);
      }
    },
    [lobbyId],
  );

  const handleLobbyDisconnected = useCallback(
    (_tournamentId: number, disconnectedLobbyId: string) => {
      if (disconnectedLobbyId === lobbyId) {
        setLiveMatchState(null);
        setLobbyState(null);
        setDisplayLobbyState(null);
      }
    },
    [lobbyId],
  );

  const handleLobbyState = useCallback(
    (data: LobbyStateDto) => {
      if (data.lobbyId !== lobbyId) {
        return;
      }

      setLobbyState(data);

      const hasGameplay = data.players.some((player) => player.screenName === "ScreenGameplay");
      const hasEvaluation = data.players.some(
        (player) => player.screenName === "ScreenEvaluationStage",
      );

      if (hasGameplay) {
        setLiveMatchState(null);
        setDisplayLobbyState(null);
        return;
      }

      if (hasEvaluation) {
        setDisplayLobbyState(data);
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

  return {
    lobbyState: liveMatchState,
    latestLobbyState: displayLobbyState ?? lobbyState,
  };
}
