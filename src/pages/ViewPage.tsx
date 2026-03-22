import LivePhase from "@/components/view/LivePhase";
import DivisionCard from "@/components/view/DivisionCard";
import DivisionView from "@/components/view/DivisionView";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Navigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Tournament } from "@/models/Tournament";
import { Division } from "@/models/Division";
import { useMatchHub } from "@/services/useMatchHub";
import { addRecentTournament, getSelectedTournament } from "@/services/recentTournaments";
import { ActiveLobbyDto } from "@/services/useScoreHub";

export default function ViewPage() {
  const { tournamentId: tidParam } = useParams<{ tournamentId?: string }>();

  const selectedTournamentId = tidParam ? Number(tidParam) : null;

  // If no tournament in URL, redirect to last selected or the select page
  if (selectedTournamentId === null) {
    const last = getSelectedTournament();
    if (last) {
      return <Navigate to={`/view/${last.id}`} replace />;
    }
    return <Navigate to="/select" replace />;
  }

  return <ViewTournament tournamentId={selectedTournamentId} />;
}

type LobbyStatus = { id: string; name: string; lobbyCode: string; isActive: boolean; isConnected: boolean };

function ViewTournament({ tournamentId }: { tournamentId: number }) {
  const [searchParams] = useSearchParams();
  const showLive = searchParams.get("live") === "1";

  const [initialActiveLobbies, setInitialActiveLobbies] = useState<ActiveLobbyDto[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const fetchedLobbies = useRef(false);

  useEffect(() => {
    axios
      .get<Tournament>(`tournaments/${tournamentId}`)
      .then((r) => {
        addRecentTournament({ id: r.data.id, name: r.data.name });
        setTournamentName(r.data.name);
      })
      .catch(() => {});

    axios
      .get<Division[]>("divisions", { params: { tournamentId } })
      .then((r) => setDivisions(r.data))
      .catch(() => {});

    if (!fetchedLobbies.current) {
      fetchedLobbies.current = true;
      axios
        .get<LobbyStatus[]>(`tournaments/${tournamentId}/lobbies/status`)
        .then((r) => {
          const active = r.data
            .filter((l) => l.isActive && l.isConnected)
            .map((l) => ({ tournamentId, lobbyId: l.id, lobbyName: l.name, lobbyCode: l.lobbyCode }));
          setInitialActiveLobbies(active);
        })
        .catch(() => {});
    }
  }, [tournamentId]);

  const onMatchUpdate = useCallback(() => {
    axios
      .get<Division[]>("divisions", { params: { tournamentId } })
      .then((r) => setDivisions(r.data))
      .catch(() => {});
  }, [tournamentId]);
  useMatchHub(onMatchUpdate, tournamentId);

  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId) ?? null;

  if (showLive) {
    return <LivePhase tournamentId={tournamentId} initialActiveLobbies={initialActiveLobbies} />;
  }

  return (
    <div>
      {selectedDivision ? (
        <DivisionView
          division={selectedDivision}
          tournamentId={tournamentId}
          controls={false}
          onBack={() => setSelectedDivisionId(null)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((division) => (
            <DivisionCard
              key={division.id}
              division={division}
              tournamentName={tournamentName}
              onSelect={() => setSelectedDivisionId(division.id)}
            />
          ))}
          {divisions.length === 0 && (
            <p className="text-gray-400 text-sm">No divisions yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
