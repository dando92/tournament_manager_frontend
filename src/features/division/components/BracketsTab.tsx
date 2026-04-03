import { useState } from "react";
import { Division } from "@/features/division/types/Division";
import { Phase } from "@/features/division/types/Phase";
import MatchList from "@/features/match/components/MatchList";
import CreateMatchModal from "@/features/match/modals/CreateMatchModal";
import CreatePhaseModal from "@/features/division/modals/CreatePhaseModal";
import * as MatchesApi from "@/features/match/services/matches.api";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faDice, faLayerGroup } from "@fortawesome/free-solid-svg-icons";

type BracketsTabProps = {
  division: Division;
  controls: boolean;
  tournamentId?: number;
  matchRefreshKey?: number;
  onDivisionChanged?: () => Promise<void>;
};

export default function BracketsTab({
  division,
  controls,
  tournamentId,
  matchRefreshKey,
  onDivisionChanged,
}: BracketsTabProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | "all">("all");
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createMatchOpen, setCreateMatchOpen] = useState(false);
  const [createPhaseOpen, setCreatePhaseOpen] = useState(false);
  const [localRefreshKey, setLocalRefreshKey] = useState(0);

  const phases = division.phases ?? [];

  const selectedPhase = selectedPhaseId !== "all"
    ? phases.find((p) => p.id === selectedPhaseId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-4">
      {controls && (
        <>
          <CreateMatchModal
            open={createMatchOpen}
            onClose={() => setCreateMatchOpen(false)}
            onCreate={async (request) => {
              await MatchesApi.create(request);
              setLocalRefreshKey((value) => value + 1);
              await onDivisionChanged?.();
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
              await onDivisionChanged?.();
            }}
          />
        </>
      )}

      {controls && (
        <div className="flex justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCreateMenuOpen((value) => !value)}
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
                    type="button"
                    onClick={() => { setCreateMenuOpen(false); setCreatePhaseOpen(true); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FontAwesomeIcon icon={faLayerGroup} className="text-primary-dark w-4" />
                    Phase
                  </button>
                  <button
                    type="button"
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
        </div>
      )}

      {/* Phase selector */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max pb-1">
          <PhaseButton
            label="Summary"
            sublabel="All phases"
            selected={selectedPhaseId === "all"}
            onClick={() => setSelectedPhaseId("all")}
          />
          {phases.map((phase) => (
            <PhaseButton
              key={phase.id}
              label={phase.name}
              sublabel={`${phase.matches?.length ?? 0} match${(phase.matches?.length ?? 0) !== 1 ? "es" : ""}`}
              selected={selectedPhaseId === phase.id}
              onClick={() => setSelectedPhaseId(phase.id)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      {selectedPhaseId === "all" ? (
        <AllPhasesView
          phases={phases}
          division={division}
          controls={controls}
          tournamentId={tournamentId}
          matchRefreshKey={(matchRefreshKey ?? 0) + localRefreshKey}
        />
      ) : selectedPhase ? (
        <PhaseSection
          phase={selectedPhase}
          division={division}
          controls={controls}
          tournamentId={tournamentId}
          matchRefreshKey={(matchRefreshKey ?? 0) + localRefreshKey}
        />
      ) : (
        <MatchList division={division} controls={controls} tournamentId={tournamentId} matchUpdateSignal={(matchRefreshKey ?? 0) + localRefreshKey} />
      )}
    </div>
  );
}

function PhaseButton({
  label,
  sublabel,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start w-32 px-3 py-1.5 rounded border text-left transition-colors text-xs ${
        selected
          ? "border-primary-dark bg-primary-dark/10 text-primary-dark"
          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span className={`font-medium ${selected ? "text-primary-dark" : "text-gray-700"}`}>{label}</span>
      {sublabel && <span className="text-gray-400">{sublabel}</span>}
    </button>
  );
}

function AllPhasesView({
  phases,
  division,
  controls,
  tournamentId,
  matchRefreshKey,
}: {
  phases: Phase[];
  division: Division;
  controls: boolean;
  tournamentId?: number;
  matchRefreshKey?: number;
}) {
  if (phases.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-8">No bracket yet.</p>;
  }

  return <MatchList division={division} controls={controls} tournamentId={tournamentId} matchUpdateSignal={matchRefreshKey} />;
}

function PhaseSection({
  phase,
  division,
  controls,
  tournamentId,
  matchRefreshKey,
}: {
  phase: Phase;
  division: Division;
  controls: boolean;
  tournamentId?: number;
  matchRefreshKey?: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-sm font-semibold text-gray-700">{phase.name}</h4>
        <span className="text-xs text-gray-400">
          {phase.matches?.length ?? 0} match{(phase.matches?.length ?? 0) !== 1 ? "es" : ""}
        </span>
      </div>
      <MatchList
        key={`phase-${phase.id}`}
        division={division}
        phaseId={phase.id}
        controls={controls}
        tournamentId={tournamentId}
        matchUpdateSignal={matchRefreshKey}
      />
    </div>
  );
}
