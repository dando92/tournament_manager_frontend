import LivePhase from "@/components/view/LivePhase";
import DivisionCard from "@/components/view/DivisionCard";
import DivisionView from "@/components/view/DivisionView";
import ManageActionsMenu from "@/components/manage/ManageActionsMenu";
import CreateDivisionModal from "@/components/modals/CreateDivisionModal";
import GenerateBracketModal from "@/components/modals/GenerateBracketModal";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Navigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Tournament } from "@/models/Tournament";
import { Division } from "@/models/Division";
import { useMatchHub } from "@/services/useMatchHub";
import { addRecentTournament, getSelectedTournament } from "@/services/recentTournaments";
import { ActiveLobbyDto } from "@/services/useScoreHub";
import { usePermissions } from "@/services/permissions/PermissionContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function TournamentPage() {
  const { tournamentId: tidParam } = useParams<{ tournamentId?: string }>();
  const selectedTournamentId = tidParam ? Number(tidParam) : null;

  if (selectedTournamentId === null) {
    const last = getSelectedTournament();
    if (last) {
      return <Navigate to={`/tournament/${last.id}`} replace />;
    }
    return <Navigate to="/select" replace />;
  }

  return <TournamentView tournamentId={selectedTournamentId} />;
}

type LobbyStatus = { id: string; name: string; lobbyCode: string; isActive: boolean; isConnected: boolean };

function TournamentView({ tournamentId }: { tournamentId: number }) {
  const [searchParams] = useSearchParams();
  const showLive = searchParams.get("live") === "1";

  const { canEditTournament, canEditHelpers } = usePermissions();
  const canControl = canEditTournament(tournamentId);
  const canHelpers = canEditHelpers(tournamentId);

  const [initialActiveLobbies, setInitialActiveLobbies] = useState<ActiveLobbyDto[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const [createDivisionOpen, setCreateDivisionOpen] = useState(false);
  const [generateBracketDivisionId, setGenerateBracketDivisionId] = useState<number | null>(null);
  const [bracketTypes, setBracketTypes] = useState<string[]>([]);
  const fetchedLobbies = useRef(false);

  useEffect(() => {
    axios
      .get<Tournament>(`tournaments/${tournamentId}`)
      .then((r) => {
        addRecentTournament({ id: r.data.id, name: r.data.name });
        setTournamentName(r.data.name);
        document.title = `${r.data.name} — Tournament Manager`;
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

    return () => {
      document.title = "Tournament Manager";
    };
  }, [tournamentId]);

  useEffect(() => {
    if (!canControl) return;
    axios.get<string[]>("match-operations/bracket-types")
      .then((r) => setBracketTypes(r.data))
      .catch(() => {});
  }, [canControl]);

  const onMatchUpdate = useCallback(() => {
    axios
      .get<Division[]>("divisions", { params: { tournamentId } })
      .then((r) => setDivisions(r.data))
      .catch(() => {});
  }, [tournamentId]);
  useMatchHub(onMatchUpdate, tournamentId);

  const handleGenerateBracket = async (bracketType: string, playerPerMatch: number) => {
    if (!generateBracketDivisionId) return;
    await axios.post(`match-operations/divisions/${generateBracketDivisionId}/generate-bracket`, {
      bracketType,
      tournamentId,
      playerPerMatch,
    });
    const r = await axios.get<Division[]>("divisions", { params: { tournamentId } });
    setDivisions(r.data);
    setSelectedDivisionId(generateBracketDivisionId);
    setGenerateBracketDivisionId(null);
  };

  const handleCreateDivision = (name: string) => {
    axios.post<Division>("divisions", { tournamentId, name })
      .then((r) => {
        setDivisions((prev) => [...prev, r.data]);
      })
      .catch(() => {});
  };

  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId) ?? null;

  if (showLive) {
    return <LivePhase tournamentId={tournamentId} initialActiveLobbies={initialActiveLobbies} />;
  }

  return (
    <div>
      <CreateDivisionModal
        open={createDivisionOpen}
        onClose={() => setCreateDivisionOpen(false)}
        onCreate={handleCreateDivision}
      />
      <GenerateBracketModal
        open={generateBracketDivisionId !== null}
        onClose={() => setGenerateBracketDivisionId(null)}
        bracketTypes={bracketTypes}
        onGenerate={handleGenerateBracket}
      />
      {selectedDivision ? (
        <DivisionView
          division={selectedDivision}
          tournamentId={tournamentId}
          controls={canControl}
          onBack={() => setSelectedDivisionId(null)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {canControl && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCreateDivisionOpen(true)}
                className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium"
              >
                <FontAwesomeIcon icon={faPlus} />
                New division
              </button>
              <ManageActionsMenu
                tournamentId={String(tournamentId)}
                canEditHelpers={canHelpers}
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {divisions.map((division) => (
              <DivisionCard
                key={division.id}
                division={division}
                tournamentName={tournamentName}
                onSelect={() => setSelectedDivisionId(division.id)}
                onGenerateBracket={canControl ? () => setGenerateBracketDivisionId(division.id) : undefined}
              />
            ))}
            {divisions.length === 0 && (
              <p className="text-gray-400 text-sm">No divisions yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
