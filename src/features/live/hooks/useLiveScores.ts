import { useMemo } from "react";
import { LiveMatchStateDto, LobbyStateDto } from "@/features/live/services/useScoreHub";

export function useLiveScores(lobbyState: LiveMatchStateDto, latestLobbyState?: LobbyStateDto) {
  const playerStateById = useMemo(
    () =>
      new Map(
        (latestLobbyState?.players ?? []).map((player) => [
          player.playerId,
          { screenName: player.screenName, isFailed: player.isFailed },
        ]),
      ),
    [latestLobbyState],
  );

  const sortedPlayers = useMemo(() => {
    return [...lobbyState.players].sort((a, b) => {
      if (a.isFailed && !b.isFailed) return 1;
      if (!a.isFailed && b.isFailed) return -1;
      if (a.exScore != null && b.exScore != null) return b.exScore - a.exScore;
      return (b.scorePercent ?? 0) - (a.scorePercent ?? 0);
    }).map((player) => ({
      ...player,
      screenName: playerStateById.get(player.playerId)?.screenName,
      isFailed: playerStateById.get(player.playerId)?.isFailed ?? player.isFailed,
    }));
  }, [lobbyState, playerStateById]);

  const songTitle = useMemo(
    () => lobbyState.songTitle || lobbyState.songPath.split("/")?.[1] || "",
    [lobbyState.songPath, lobbyState.songTitle],
  );

  return {
    showJudgements: true,
    sortedPlayers,
    songTitle,
  };
}
