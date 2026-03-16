import { useState, useCallback } from "react";
import { Division } from "@/models/Division";
import { Phase } from "@/models/Phase";
import axios from "axios";
import MatchesView from "@/components/manage/tournament/MatchesView";
import LobbyLiveBlock from "@/components/view/LobbyLiveBlock";
import { useMatchHub } from "@/services/useMatchHub";
import { useScoreHub, TournamentLobbyStateDto } from "@/services/useScoreHub";

type TournamentLiveState = {
  phase: Phase | null;
  division: Division | null;
  matchUpdateSignal: number;
};

type Props = {
  tournamentId: number;
};

export default function LivePhase({ tournamentId }: Props) {
  const [tournamentStates, setTournamentStates] = useState<Map<number, TournamentLiveState>>(new Map());
  // keyed by lobbyId
  const [lobbyStates, setLobbyStates] = useState<Map<string, TournamentLobbyStateDto>>(new Map());

  const fetchPhaseAndDivision = useCallback(
    (tid: number, phaseId: number, divisionId: number) => {
      Promise.all([
        axios.get<Phase>(`/phases/${phaseId}`),
        axios.get<Division>(`/divisions/${divisionId}`),
      ])
        .then(([phaseRes, divRes]) => {
          setTournamentStates((prev) => {
            const next = new Map(prev);
            const curr = next.get(tid);
            next.set(tid, {
              phase: phaseRes.data,
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
    if (data.phaseId && data.divisionId && data.tournamentId) {
      fetchPhaseAndDivision(data.tournamentId, data.phaseId, data.divisionId);
    }
  });

  const handleLobbyDisconnected = useCallback((_tid: number, lobbyId: string) => {
    setLobbyStates((prev) => { const next = new Map(prev); next.delete(lobbyId); return next; });
  }, []);

  useScoreHub((data) => {
    if (!data?.players?.length) return;
    setLobbyStates((prev) => new Map(prev).set(data.lobbyId, data));
  }, handleLobbyDisconnected);

  const state = tournamentStates.get(tournamentId);
  const tournamentLobbies = Array.from(lobbyStates.values()).filter(
    (ls) => ls.tournamentId === tournamentId,
  );
  const hasLiveData = tournamentStates.has(tournamentId) || tournamentLobbies.length > 0;

  if (!hasLiveData) {
    return <p className="text-gray-500">No live matches.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {tournamentLobbies.map((ls) => (
          <LobbyLiveBlock key={ls.lobbyId} lobbyState={ls} />
        ))}
      </div>
      {state?.division && state?.phase && (
        <div>
          <h3 className="text-center text-5xl text-rossoTesto font-bold">
            {state.division.name}
          </h3>
          <MatchesView
            phaseId={state.phase.id}
            division={state.division}
            matchUpdateSignal={state.matchUpdateSignal}
          />
        </div>
      )}
    </div>
  );
}
