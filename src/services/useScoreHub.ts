import { useEffect } from "react";

export type LobbyPlayerDto = {
  name: string;
  playerId: string;
  scorePercent: number;
  health: number;
  isFailed: boolean;
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

export type TournamentLobbyStateDto = {
  tournamentId: number;
  songTitle: string;
  songPath: string;
  players: LobbyPlayerDto[];
};

function wsUrl(path: string): string {
  const apiUrl = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:3000/";
  const resolved = new URL('../' + path, apiUrl);
  return resolved.href.replace(/^http/, 'ws');
}

/**
 * Creates a native WebSocket connection to /scoreupdatehub for the duration of the component's life.
 * Calls onLobbyState whenever an OnLobbyState event arrives.
 * Calls onLobbyDisconnected whenever an OnLobbyDisconnected event arrives.
 */
export function useScoreHub(
  onLobbyState: (data: TournamentLobbyStateDto) => void,
  onLobbyDisconnected?: (tournamentId: number) => void,
) {
  useEffect(() => {
    const ws = new WebSocket(wsUrl('scoreupdatehub'));

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'OnLobbyState') {
          onLobbyState(msg.data as TournamentLobbyStateDto);
        } else if (msg.event === 'OnLobbyDisconnected') {
          onLobbyDisconnected?.(msg.data.tournamentId as number);
        }
      } catch {}
    };

    return () => { ws.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
