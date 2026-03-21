import { useEffect } from "react";

type MatchUpdateData = {
  matchId: number;
  divisionId: number;
  tournamentId: number;
};

function wsUrl(path: string): string {
  const apiUrl = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:3000/";
  const resolved = new URL('../' + path, apiUrl);
  return resolved.href.replace(/^http/, 'ws');
}

/**
 * Creates a native WebSocket connection to /matchupdatehub for the duration of the component's life.
 * Calls onUpdate whenever an OnMatchUpdate event arrives for the given tournamentId.
 * If tournamentId is undefined, reacts to all updates.
 */
export function useMatchHub(onUpdate: (data: MatchUpdateData) => void, tournamentId?: number) {
  useEffect(() => {
    const ws = new WebSocket(wsUrl('matchupdatehub'));

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'OnMatchUpdate') {
          const data: MatchUpdateData = msg.data;
          if (tournamentId !== undefined && data.tournamentId !== tournamentId) return;
          onUpdate(data);
        }
      // eslint-disable-next-line no-empty
      } catch {}
    };

    return () => { ws.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);
}
