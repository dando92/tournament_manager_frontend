import { useState, useCallback, useEffect } from "react";
import { Division } from "../../models/Division";
import { Phase } from "../../models/Phase";
import { Tournament } from "../../models/Tournament";
import axios from "axios";
import MatchesView from "../manage/tournament/MatchesView";
import LiveScores from "./LiveScores";
import { useMatchHub } from "../../services/useMatchHub";
import { useScoreHub, TournamentLobbyStateDto } from "../../services/useScoreHub";

type TournamentLiveState = {
  phase: Phase | null;
  division: Division | null;
  matchUpdateSignal: number;
};

export default function LivePhase() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentStates, setTournamentStates] = useState<Map<number, TournamentLiveState>>(new Map());
  const [lobbyStates, setLobbyStates] = useState<Map<number, TournamentLobbyStateDto>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    axios.get<Tournament[]>("tournaments/public")
      .then((r) => { setTournaments(r.data); setError(null); })
      .catch(() => setError("Failed to load tournaments."))
      .finally(() => setIsLoading(false));
  }, []);

  const fetchPhaseAndDivision = useCallback((tournamentId: number, phaseId: number, divisionId: number) => {
    Promise.all([
      axios.get<Phase>(`/phases/${phaseId}`),
      axios.get<Division>(`/divisions/${divisionId}`),
    ])
      .then(([phaseRes, divRes]) => {
        setTournamentStates((prev) => {
          const next = new Map(prev);
          const curr = next.get(tournamentId);
          next.set(tournamentId, {
            phase: phaseRes.data,
            division: divRes.data,
            matchUpdateSignal: (curr?.matchUpdateSignal ?? 0) + 1,
          });
          return next;
        });
      })
      .catch(() => {});
  }, []);

  useMatchHub((data) => {
    if (data.phaseId && data.divisionId && data.tournamentId) {
      fetchPhaseAndDivision(data.tournamentId, data.phaseId, data.divisionId);
    }
  });

  const handleLobbyDisconnected = useCallback((tournamentId: number) => {
    setLobbyStates((prev) => { const next = new Map(prev); next.delete(tournamentId); return next; });
    setTournamentStates((prev) => { const next = new Map(prev); next.delete(tournamentId); return next; });
  }, []);

  useScoreHub((data) => {
    if (!data?.players?.length) return;
    setLobbyStates((prev) => new Map(prev).set(data.tournamentId, data));
  }, handleLobbyDisconnected);

  const activeTournaments = tournaments.filter(
    (t) => tournamentStates.has(t.id) || lobbyStates.has(t.id),
  );

  if (isLoading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (activeTournaments.length === 0) {
    return <p>No live events. Stay tuned!</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {activeTournaments.map((tournament) => {
        const state = tournamentStates.get(tournament.id);
        const lobbyState = lobbyStates.get(tournament.id);

        return (
          <div key={tournament.id}>
            <h2 className="text-2xl text-rossoTesto font-bold mb-2">{tournament.name}</h2>

            {import.meta.env.VITE_PUBLIC_ENABLE_LIVE_SCORES === "true" && lobbyState && (
              <LiveScores lobbyState={lobbyState} />
            )}

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
      })}
    </div>
  );
}
