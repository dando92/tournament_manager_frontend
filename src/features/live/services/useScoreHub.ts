import { useEffect } from "react";

export type LobbyPlayerDto = {
  name: string;
  playerId: string;
  screenName: "NoScreen" | "ScreenSelectMusic" | "ScreenGameplay" | "ScreenPlayerOptions" | "ScreenEvaluationStage";
  ready: boolean;
  isFailed?: boolean;
};

export type LobbyStateDto = {
  tournamentId: number;
  lobbyId: string;
  lobbyName: string;
  lobbyCode: string;
  songTitle: string;
  songPath: string;
  spectators: string[];
  players: LobbyPlayerDto[];
};

export type LiveMatchPlayerDto = {
  name: string;
  playerId: string;
  scorePercent: number;
  exScore?: number;
  isFailed?: boolean;
  songProgression?: {
    currentTime: number;
    totalTime: number;
  };
  judgments?: {
    fantasticPlus: number;
    fantastics: number;
    excellents: number;
    greats: number;
    decents: number;
    wayOffs: number;
    misses: number;
    minesHit: number;
    holdsHeld: number;
    totalHolds: number;
  };
};

export type LiveMatchStateDto = {
  tournamentId: number;
  lobbyId: string;
  lobbyName: string;
  lobbyCode: string;
  songTitle: string;
  songPath: string;
  players: LiveMatchPlayerDto[];
};

export type ActiveLobbyDto = {
  tournamentId: number;
  lobbyId: string;
  lobbyName: string;
  lobbyCode: string;
};

type ScoreHubMessage =
  | { event: "OnLobbyActive"; data: ActiveLobbyDto }
  | { event: "OnLobbyDisconnected"; data: { tournamentId: number; lobbyId: string } }
  | { event: "OnLobbyState"; data: LobbyStateDto }
  | { event: "OnLiveMatchState"; data: LiveMatchStateDto };

export function scoreHubUrl(): string {
  const apiUrl = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:3000/";
  const resolved = new URL("../scoreupdatehub", apiUrl);
  return resolved.href.replace(/^http/, "ws");
}

export function useScoreHub(
  onLiveMatchState: (data: LiveMatchStateDto) => void,
  onLobbyDisconnected?: (tournamentId: number, lobbyId: string) => void,
  onLobbyActive?: (data: ActiveLobbyDto) => void,
  onLobbyState?: (data: LobbyStateDto) => void,
) {
  useEffect(() => {
    const ws = new WebSocket(scoreHubUrl());

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ScoreHubMessage;
        if (msg.event === "OnLiveMatchState") {
          onLiveMatchState(msg.data);
        } else if (msg.event === "OnLobbyDisconnected") {
          onLobbyDisconnected?.(msg.data.tournamentId, msg.data.lobbyId);
        } else if (msg.event === "OnLobbyActive") {
          onLobbyActive?.(msg.data);
        } else if (msg.event === "OnLobbyState") {
          onLobbyState?.(msg.data);
        }
      } catch {
        // ignore malformed websocket messages
      }
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
