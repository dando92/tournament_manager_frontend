import DivisionCard from "@/features/division/components/DivisionCard";
import CreateDivisionModal from "@/features/division/modals/CreateDivisionModal";
import GenerateBracketModal from "@/features/division/modals/GenerateBracketModal";
import ManageActionsMenu from "@/features/match/components/ManageActionsMenu";
import BaseModal from "@/shared/components/ui/BaseModal";
import { btnPrimary } from "@/styles/buttonStyles";
import { useState, useEffect, useCallback, useRef } from "react";
import { Navigate, Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import axios from "axios";
import { Tournament } from "@/features/tournament/types/Tournament";
import { Division } from "@/features/division/types/Division";
import { addRecentTournament, getSelectedTournament } from "@/features/tournament/services/recentTournaments";
import { ActiveLobbyDto } from "@/features/live/services/useScoreHub";
import { usePermissions } from "@/shared/services/permissions/PermissionContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faDiagramProject, faPlus } from "@fortawesome/free-solid-svg-icons";

const TOURNAMENT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "divisions", label: "Divisions" },
  { key: "songs", label: "Songs" },
  { key: "live", label: "Live" },
  { key: "stats", label: "Stats" },
] as const;

type TournamentTabKey = (typeof TOURNAMENT_TABS)[number]["key"];

export type TournamentPageContext = {
  tournamentId: number;
  tournamentName: string;
  divisions: Division[];
  controls: boolean;
  helpersEnabled: boolean;
  initialActiveLobbies: ActiveLobbyDto[];
  refreshDivisions: () => Promise<void>;
  openCreateDivision: () => void;
  openGenerateBracketPicker: () => void;
};

type DivisionPickerModalProps = {
  open: boolean;
  divisions: Division[];
  onClose: () => void;
  onSelect: (divisionId: number) => void;
};

function SelectDivisionForBracketModal({
  open,
  divisions,
  onClose,
  onSelect,
}: DivisionPickerModalProps) {
  return (
    <BaseModal open={open} onClose={onClose} title="Select Division" maxWidth="max-w-lg">
      <div className="flex flex-col gap-3">
        {divisions.length === 0 ? (
          <p className="text-sm text-gray-400">No divisions available.</p>
        ) : (
          divisions.map((division) => {
            const playerCount = division.players?.length ?? 0;
            const disabled = playerCount === 0;

            return (
              <button
                key={division.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(division.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                  disabled
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-primary-dark hover:bg-primary-dark/5"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm">{division.name}</div>
                    <div className="text-xs text-gray-500">
                      {playerCount} player{playerCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className="text-xs font-medium">
                    {disabled ? "No players" : "Generate"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </BaseModal>
  );
}

export function useTournamentPageContext() {
  return useOutletContext<TournamentPageContext>();
}

export default function TournamentPage() {
  const { tournamentId: tidParam } = useParams<{ tournamentId?: string }>();
  const selectedTournamentId = tidParam ? Number(tidParam) : null;

  if (selectedTournamentId === null) {
    const last = getSelectedTournament();
    if (last) {
      return <Navigate to={`/tournament/${last.id}/overview`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <TournamentLayout tournamentId={selectedTournamentId} />;
}

function TournamentLayout({ tournamentId }: { tournamentId: number }) {
  const { canEditTournament, canEditHelpers } = usePermissions();
  const canControl = canEditTournament(tournamentId);
  const canHelpers = canEditHelpers(tournamentId);
  const navigate = useNavigate();
  const location = useLocation();

  const [initialActiveLobbies, setInitialActiveLobbies] = useState<ActiveLobbyDto[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [createDivisionOpen, setCreateDivisionOpen] = useState(false);
  const [selectDivisionOpen, setSelectDivisionOpen] = useState(false);
  const [generateBracketDivisionId, setGenerateBracketDivisionId] = useState<number | null>(null);
  const [bracketTypes, setBracketTypes] = useState<string[]>([]);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const fetchedLobbies = useRef(false);

  const refreshDivisions = useCallback(async () => {
    const response = await axios.get<Division[]>("divisions", { params: { tournamentId } });
    setDivisions(response.data);
  }, [tournamentId]);

  useEffect(() => {
    axios
      .get<Tournament>(`tournaments/${tournamentId}`)
      .then((r) => {
        addRecentTournament({ id: r.data.id, name: r.data.name });
        setTournamentName(r.data.name);
        document.title = `${r.data.name} - Tournament Manager`;
      })
      .catch(() => {});

    refreshDivisions().catch(() => {});

    if (!fetchedLobbies.current) {
      fetchedLobbies.current = true;
      axios
        .get<{ id: string; name: string; lobbyCode: string; isActive: boolean; isConnected: boolean }[]>(`tournaments/${tournamentId}/lobbies/status`)
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
  }, [refreshDivisions, tournamentId]);

  useEffect(() => {
    if (!canControl) return;
    axios.get<string[]>("bracket/bracket-types")
      .then((r) => setBracketTypes(r.data))
      .catch(() => {});
  }, [canControl]);

  const handleGenerateBracket = async (bracketType: string, playerPerMatch: number) => {
    if (!generateBracketDivisionId) return;
    await axios.post(`bracket/divisions/${generateBracketDivisionId}/generate-bracket`, {
      bracketType,
      tournamentId,
      playerPerMatch,
    });
    await refreshDivisions();
    navigate(`/tournament/${tournamentId}/division/${generateBracketDivisionId}/phases`);
    setGenerateBracketDivisionId(null);
  };

  const handleCreateDivision = (name: string) => {
    axios.post<Division>("divisions", { tournamentId, name })
      .then((r) => {
        setDivisions((prev) => [...prev, r.data]);
      })
      .catch(() => {});
  };

  const activeTab: TournamentTabKey =
    TOURNAMENT_TABS.find((tab) => location.pathname.endsWith(`/${tab.key}`))?.key ?? "overview";

  return (
    <div className="flex flex-col gap-4">
      <CreateDivisionModal
        open={createDivisionOpen}
        onClose={() => setCreateDivisionOpen(false)}
        onCreate={handleCreateDivision}
      />
      <SelectDivisionForBracketModal
        open={selectDivisionOpen}
        divisions={divisions}
        onClose={() => setSelectDivisionOpen(false)}
        onSelect={(divisionId) => {
          setSelectDivisionOpen(false);
          setGenerateBracketDivisionId(divisionId);
        }}
      />
      <GenerateBracketModal
        open={generateBracketDivisionId !== null}
        onClose={() => setGenerateBracketDivisionId(null)}
        bracketTypes={bracketTypes}
        onGenerate={handleGenerateBracket}
      />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-gray-900">{tournamentName}</h1>
          <p className="text-sm text-gray-500">Tournament workspace</p>
        </div>

        {canControl && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCreateMenuOpen((value) => !value)}
                className={`flex items-center gap-2 ${btnPrimary}`}
              >
                Create
                <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
              </button>
              {createMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCreateMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[180px]">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateMenuOpen(false);
                        setCreateDivisionOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-primary-dark" />
                      New division
                    </button>
                    <button
                      type="button"
                      disabled={divisions.length === 0}
                      onClick={() => {
                        setCreateMenuOpen(false);
                        setSelectDivisionOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faDiagramProject} className="text-primary-dark" />
                      Generate bracket
                    </button>
                  </div>
                </>
              )}
            </div>
            <ManageActionsMenu
              tournamentId={String(tournamentId)}
              canEditHelpers={canHelpers}
            />
          </div>
        )}
      </div>

      <div className="flex items-end border-b border-gray-200 overflow-x-auto">
        {TOURNAMENT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(`/tournament/${tournamentId}/${tab.key}`)}
            className={`px-4 py-2 text-sm border-b-2 shrink-0 transition-colors ${
              activeTab === tab.key
                ? "border-primary-dark text-primary-dark font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Outlet context={{
        tournamentId,
        tournamentName,
        divisions,
        controls: canControl,
        helpersEnabled: canHelpers,
        initialActiveLobbies,
        refreshDivisions,
        openCreateDivision: () => setCreateDivisionOpen(true),
        openGenerateBracketPicker: () => setSelectDivisionOpen(true),
      } satisfies TournamentPageContext} />
    </div>
  );
}

export function TournamentOverviewTab() {
  const { divisions, tournamentName, tournamentId } = useTournamentPageContext();
  const navigate = useNavigate();

  const divisionCount = divisions.length;
  const playerCount = divisions.reduce((count, division) => count + (division.players?.length ?? 0), 0);
  const matchCount = divisions.reduce(
    (count, division) => count + (division.phases ?? []).reduce((sum, phase) => sum + (phase.matches?.length ?? 0), 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Tournament</div>
          <div className="mt-2 text-xl font-bold text-gray-900">{tournamentName}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Divisions</div>
          <div className="mt-2 text-3xl font-black text-primary-dark">{divisionCount}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Players / Matches</div>
          <div className="mt-2 text-3xl font-black text-primary-dark">{playerCount} / {matchCount}</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Divisions</h2>
            <p className="text-sm text-gray-500">Quick access to each division page.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/tournament/${tournamentId}/divisions`)}
            className="text-sm font-medium text-primary-dark hover:text-primary-dark/80"
          >
            Open all
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {divisions.slice(0, 4).map((division) => (
            <DivisionCard
              key={division.id}
              division={division}
              tournamentName={tournamentName}
              onSelect={() => navigate(`/tournament/${tournamentId}/division/${division.id}/phases`)}
            />
          ))}
          {divisions.length === 0 && (
            <p className="text-sm text-gray-400">No divisions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function TournamentDivisionsTab() {
  const { divisions, tournamentId, tournamentName } = useTournamentPageContext();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {divisions.map((division) => (
        <DivisionCard
          key={division.id}
          division={division}
          tournamentName={tournamentName}
          onSelect={() => navigate(`/tournament/${tournamentId}/division/${division.id}/phases`)}
        />
      ))}
      {divisions.length === 0 && (
        <p className="text-gray-400 text-sm">No divisions yet.</p>
      )}
    </div>
  );
}
