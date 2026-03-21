import { useState, useCallback, useEffect } from "react";
import { Division } from "@/models/Division";
import axios from "axios";
import MatchesView from "@/components/manage/tournament/MatchesView";
import LobbyLiveBlock from "@/components/view/LobbyLiveBlock";
import { useMatchHub } from "@/services/useMatchHub";
import { useScoreHub, TournamentLobbyStateDto, ActiveLobbyDto } from "@/services/useScoreHub";

type TournamentLiveState = {
  division: Division | null;
  matchUpdateSignal: number;
};

type Props = {
  tournamentId: number;
  initialActiveLobbies?: ActiveLobbyDto[];
};

export default function LivePhase({ tournamentId, initialActiveLobbies }: Props) {
  const [tournamentStates, setTournamentStates] = useState<Map<number, TournamentLiveState>>(new Map());
  // keyed by lobbyId — lobbies that are active (started connecting)
  const [activeLobbies, setActiveLobbies] = useState<Map<string, ActiveLobbyDto>>(new Map());
  // keyed by lobbyId — lobbies that are connected and sending state
  const [lobbyStates, setLobbyStates] = useState<Map<string, TournamentLobbyStateDto>>(new Map());

  // Seed active lobbies from REST result once it arrives
  useEffect(() => {
    if (!initialActiveLobbies?.length) return;
    setActiveLobbies((prev) => {
      const next = new Map(prev);
      initialActiveLobbies.forEach((l) => next.set(l.lobbyId, l));
      return next;
    });
  }, [initialActiveLobbies]);

  const fetchDivision = useCallback(
    (tid: number, divisionId: number) => {
      axios.get<Division>(`/divisions/${divisionId}`)
        .then((divRes) => {
          setTournamentStates((prev) => {
            const next = new Map(prev);
            const curr = next.get(tid);
            next.set(tid, {
              division: divRes.data,
              matchUpdateSignal: (curr?.matchUpdateSignal ?? 0) + 1,
            });
            return next;
          });
        })
        .catch(() => {});
    },
    [],
  );

  useMatchHub((data) => {
    if (data.divisionId && data.tournamentId) {
      fetchDivision(data.tournamentId, data.divisionId);
    }
  });

  const handleLobbyDisconnected = useCallback((_tid: number, lobbyId: string) => {
    setActiveLobbies((prev) => { const next = new Map(prev); next.delete(lobbyId); return next; });
    setLobbyStates((prev) => { const next = new Map(prev); next.delete(lobbyId); return next; });
  }, []);

  const handleLobbyActive = useCallback((data: ActiveLobbyDto) => {
    setActiveLobbies((prev) => new Map(prev).set(data.lobbyId, data));
  }, []);

  useScoreHub(
    (data) => {
      if (!data?.players?.length) return;
      setLobbyStates((prev) => new Map(prev).set(data.lobbyId, data));
    },
    handleLobbyDisconnected,
    handleLobbyActive,
  );

  const state = tournamentStates.get(tournamentId);
  const tournamentActiveLobbies = Array.from(activeLobbies.values()).filter(
    (l) => l.tournamentId === tournamentId,
  );
  const tournamentLobbies = Array.from(lobbyStates.values()).filter(
    (ls) => ls.tournamentId === tournamentId,
  );

  const hasActiveAndConnected = tournamentActiveLobbies.length > 0 && tournamentLobbies.length > 0;
  const hasMatchData = tournamentStates.has(tournamentId);

  if (!hasActiveAndConnected && !hasMatchData) {
    return <p className="text-gray-500">No active lobbies.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {tournamentLobbies.map((ls) => (
          <LobbyLiveBlock key={ls.lobbyId} lobbyState={ls} />
        ))}
        {tournamentActiveLobbies
          .filter((l) => !lobbyStates.has(l.lobbyId))
          .map((l) => (
            <div key={l.lobbyId} className="p-4 rounded-md bg-gray-700 text-gray-400">
              <span className="font-semibold">{l.lobbyName}</span>
              <span className="ml-2 text-sm">Connecting…</span>
            </div>
          ))}
      </div>
      {state?.division && (
        <div>
          <h3 className="text-center text-5xl text-rossoTesto font-bold">
            {state.division.name}
          </h3>
          <MatchesView
            division={state.division}
            matchUpdateSignal={state.matchUpdateSignal}
          />
        </div>
      )}
    </div>
  );
}
