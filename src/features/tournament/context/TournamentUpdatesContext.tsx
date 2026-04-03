import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";

type TournamentUpdateMessage = {
  tournamentId: number;
};

type DivisionUpdateMessage = {
  tournamentId: number;
  divisionId: number;
};

type PhaseUpdateMessage = {
  tournamentId: number;
  divisionId: number;
  phaseId: number;
};

type MatchUpdateMessage = {
  tournamentId: number;
  divisionId: number;
  phaseId: number;
  matchId: number;
};

type TournamentSocketMessage =
  | { event: "TournamentUpdate"; data: TournamentUpdateMessage }
  | { event: "DivisionUpdate"; data: DivisionUpdateMessage }
  | { event: "PhaseUpdate"; data: PhaseUpdateMessage }
  | { event: "MatchUpdate"; data: MatchUpdateMessage };

type TournamentUpdatesContextValue = {
  tournamentVersion: number;
  divisionDetailVersions: ReadonlyMap<number, number>;
  matchListVersions: ReadonlyMap<number, number>;
  updatedMatchIds: ReadonlySet<number>;
};

const defaultValue: TournamentUpdatesContextValue = {
  tournamentVersion: 0,
  divisionDetailVersions: new Map(),
  matchListVersions: new Map(),
  updatedMatchIds: new Set(),
};

const TournamentUpdatesContext = createContext<TournamentUpdatesContextValue>(defaultValue);

function wsUrl(path: string): string {
  const apiUrl = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:3000/";
  const resolved = new URL(`../${path}`, apiUrl);
  return resolved.href.replace(/^http/, "ws");
}

function incrementVersion(map: ReadonlyMap<number, number>, id: number): Map<number, number> {
  const next = new Map(map);
  next.set(id, (next.get(id) ?? 0) + 1);
  return next;
}

export function TournamentUpdatesProvider({
  tournamentId,
  children,
}: {
  tournamentId: number;
  children: ReactNode;
}) {
  const [tournamentVersion, setTournamentVersion] = useState(0);
  const [divisionDetailVersions, setDivisionDetailVersions] = useState<ReadonlyMap<number, number>>(new Map());
  const [matchListVersions, setMatchListVersions] = useState<ReadonlyMap<number, number>>(new Map());
  const [updatedMatchIds, setUpdatedMatchIds] = useState<ReadonlySet<number>>(new Set());
  const pendingMatchIds = useRef<Set<number>>(new Set());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl("uiupdatehub"));

    function flushMatchUpdates() {
      const flush = new Set(pendingMatchIds.current);
      pendingMatchIds.current = new Set();
      setUpdatedMatchIds(flush);
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as TournamentSocketMessage;

        if (!msg?.data || msg.data.tournamentId !== tournamentId) {
          return;
        }

        switch (msg.event) {
          case "TournamentUpdate":
            setTournamentVersion((value) => value + 1);
            break;
          case "DivisionUpdate":
            setDivisionDetailVersions((prev) => incrementVersion(prev, msg.data.divisionId));
            break;
          case "PhaseUpdate":
            setDivisionDetailVersions((prev) => incrementVersion(prev, msg.data.divisionId));
            setMatchListVersions((prev) => incrementVersion(prev, msg.data.divisionId));
            break;
          case "MatchUpdate":
            pendingMatchIds.current.add(msg.data.matchId);
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(flushMatchUpdates, 50);
            break;
        }
      } catch {
        // ignore malformed websocket messages
      }
    };

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      ws.close();
    };
  }, [tournamentId]);

  return (
    <TournamentUpdatesContext.Provider
      value={{
        tournamentVersion,
        divisionDetailVersions,
        matchListVersions,
        updatedMatchIds,
      }}
    >
      {children}
    </TournamentUpdatesContext.Provider>
  );
}

export function useTournamentUpdates() {
  return useContext(TournamentUpdatesContext);
}
