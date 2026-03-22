import { useState } from "react";
import { Division } from "@/models/Division";
import { Phase } from "@/models/Phase";
import { Match } from "@/models/Match";
import MatchList from "@/components/manage/tournament/MatchList";

type BracketsTabProps = {
  division: Division;
  controls: boolean;
  tournamentId?: number;
};

export default function BracketsTab({ division, controls, tournamentId }: BracketsTabProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | "all">("all");

  const phases = division.phases ?? [];

  // Collect match IDs that belong to any phase
  const phasedMatchIds = new Set(phases.flatMap((p) => p.matches?.map((m) => m.id) ?? []));
  const unassignedMatches = (division.matches ?? []).filter((m) => !phasedMatchIds.has(m.id));

  const selectedPhase = selectedPhaseId !== "all"
    ? phases.find((p) => p.id === selectedPhaseId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Phase selector */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max pb-1">
          <PhaseButton
            label="Summary · All phases"
            selected={selectedPhaseId === "all"}
            onClick={() => setSelectedPhaseId("all")}
          />
          {phases.map((phase) => (
            <PhaseButton
              key={phase.id}
              label={phase.name}
              sublabel={`${phase.matches?.length ?? 0} bracket${(phase.matches?.length ?? 0) !== 1 ? "s" : ""}`}
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
          unassignedMatches={unassignedMatches}
          division={division}
          controls={controls}
          tournamentId={tournamentId}
        />
      ) : selectedPhase ? (
        <PhaseSection
          phase={selectedPhase}
          division={division}
          controls={controls}
          tournamentId={tournamentId}
        />
      ) : (
        <MatchList division={division} controls={controls} tournamentId={tournamentId} />
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
      className={`flex flex-col items-start px-3 py-1.5 rounded border text-left transition-colors text-xs ${
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
  unassignedMatches,
  division,
  controls,
  tournamentId,
}: {
  phases: Phase[];
  unassignedMatches: Match[];
  division: Division;
  controls: boolean;
  tournamentId?: number;
}) {
  if (phases.length === 0) {
    return <MatchList division={division} controls={controls} tournamentId={tournamentId} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {phases.map((phase) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          division={division}
          controls={controls}
          tournamentId={tournamentId}
        />
      ))}
      {unassignedMatches.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Unassigned</h4>
          <MatchList division={division} controls={controls} tournamentId={tournamentId} />
        </div>
      )}
    </div>
  );
}

function PhaseSection({
  phase,
  division,
  controls,
  tournamentId,
}: {
  phase: Phase;
  division: Division;
  controls: boolean;
  tournamentId?: number;
}) {
  // Create a view of the division containing only this phase's matches
  const phaseDivision: Division = { ...division, matches: phase.matches ?? [] };

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
        division={phaseDivision}
        controls={controls}
        tournamentId={tournamentId}
      />
    </div>
  );
}
