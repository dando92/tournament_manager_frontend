import { useState } from "react";
import { Division } from "@/features/division/types/Division";
import { Phase } from "@/features/division/types/Phase";
import MatchList from "@/features/match/components/MatchList";

type BracketsTabProps = {
  division: Division;
  controls: boolean;
  tournamentId?: number;
  matchRefreshKey?: number;
};

export default function BracketsTab({ division, controls, tournamentId, matchRefreshKey }: BracketsTabProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | "all">("all");

  const phases = division.phases ?? [];

  const selectedPhase = selectedPhaseId !== "all"
    ? phases.find((p) => p.id === selectedPhaseId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-4">
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
          matchRefreshKey={matchRefreshKey}
        />
      ) : selectedPhase ? (
        <PhaseSection
          phase={selectedPhase}
          division={division}
          controls={controls}
          tournamentId={tournamentId}
          matchRefreshKey={matchRefreshKey}
        />
      ) : (
        <MatchList division={division} controls={controls} tournamentId={tournamentId} matchUpdateSignal={matchRefreshKey} />
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
