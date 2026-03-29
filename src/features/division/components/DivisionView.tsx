import { useCallback, useRef, useState } from "react";
import { Division } from "@/features/division/types/Division";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronDown, faLayerGroup, faDice } from "@fortawesome/free-solid-svg-icons";
import BracketsTab from "@/features/division/components/BracketsTab";
import PlayersTab from "@/features/division/components/PlayersTab";
import LivePhase from "@/features/live/components/LivePhase";
import SongsList from "@/features/song/components/SongsList";
import CreateMatchModal from "@/features/match/modals/CreateMatchModal";
import CreatePhaseModal from "@/features/division/modals/CreatePhaseModal";
import { usePermissions } from "@/shared/services/permissions/PermissionContext";
import { useMatchHub } from "@/features/live/services/useMatchHub";
import { MatchUpdateContext } from "@/features/match/context/MatchUpdateContext";
import * as MatchesApi from "@/features/match/services/matches.api";
import axios from "axios";

type Tab = "Overview" | "Brackets" | "Live" | "Songs" | "Standings" | "Stats" | "Players";
const TABS: Tab[] = ["Overview", "Brackets", "Songs", "Players", "Live", "Standings", "Stats"];

type DivisionViewProps = {
  division: Division;
  tournamentId: number;
  controls: boolean;
  onBack: () => void;
  onPlayersChanged: () => void;
};

export default function DivisionView({ division, tournamentId, controls, onBack, onPlayersChanged }: DivisionViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Brackets");
  const { canEditTournament } = usePermissions();
  const canEditSongs = canEditTournament(tournamentId);

  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createMatchOpen, setCreateMatchOpen] = useState(false);
  const [createPhaseOpen, setCreatePhaseOpen] = useState(false);
  const [matchRefreshKey, setMatchRefreshKey] = useState(0);

  const [updatedMatchIds, setUpdatedMatchIds] = useState<ReadonlySet<number>>(new Set());
  const phaseIds = new Set(division.phases.map(p => p.id));
  const pendingUpdates = useRef<Set<number>>(new Set());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMatchHubUpdate = useCallback((data: { matchId: number; phaseId: number }) => {
    if (!phaseIds.has(data.phaseId)) return;
    pendingUpdates.current.add(data.matchId);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const flush = new Set(pendingUpdates.current);
      pendingUpdates.current = new Set();
      setUpdatedMatchIds(flush);
    }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division.id]);
  useMatchHub(handleMatchHubUpdate, tournamentId);

  return (
    <MatchUpdateContext.Provider value={updatedMatchIds}>
    <div className="flex flex-col gap-3">
      {controls && (
        <>
          <CreateMatchModal
            open={createMatchOpen}
            onClose={() => setCreateMatchOpen(false)}
            onCreate={async (request) => {
              await MatchesApi.create(request);
              setMatchRefreshKey((k) => k + 1);
            }}
            phases={division.phases}
            divisionId={division.id}
            tournamentId={tournamentId}
          />
          <CreatePhaseModal
            open={createPhaseOpen}
            onClose={() => setCreatePhaseOpen(false)}
            onCreate={async (name) => {
              await axios.post("phases", { name, divisionId: division.id });
              onPlayersChanged();
            }}
          />
        </>
      )}

      {/* Back + title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 flex items-center gap-1.5 text-sm"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            All divisions
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-700">{division.name}</span>
        </div>
        {controls && (
          <div className="relative">
            <button
              onClick={() => setCreateMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 font-medium"
            >
              Create
              <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
            </button>
            {createMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCreateMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[130px]">
                  <button
                    onClick={() => { setCreateMenuOpen(false); setCreatePhaseOpen(true); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FontAwesomeIcon icon={faLayerGroup} className="text-primary-dark w-4" />
                    Phase
                  </button>
                  <button
                    onClick={() => { setCreateMenuOpen(false); setCreateMatchOpen(true); }}
                    disabled={division.phases.length === 0}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faDice} className="text-primary-dark w-4" />
                    Match
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-end border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-b-2 shrink-0 transition-colors ${
              activeTab === tab
                ? "border-primary-dark text-primary-dark font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-1">
        {activeTab === "Brackets" && (
          <BracketsTab division={division} controls={controls} tournamentId={tournamentId} matchRefreshKey={matchRefreshKey} />
        )}
        {activeTab === "Live" && (
          <LivePhase tournamentId={tournamentId} />
        )}
        {activeTab === "Songs" && (
          <SongsList canEdit={canEditSongs} tournamentId={tournamentId} />
        )}
        {activeTab === "Players" && (
          <PlayersTab division={division} canEdit={controls} onPlayersChanged={onPlayersChanged} />
        )}
        {activeTab !== "Brackets" && activeTab !== "Live" && activeTab !== "Songs" && activeTab !== "Players" && (
          <p className="text-sm text-gray-400 italic">Coming soon</p>
        )}
      </div>
    </div>
    </MatchUpdateContext.Provider>
  );
}
