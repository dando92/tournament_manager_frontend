import { useState } from "react";
import MatchList from "@/features/match/components/MatchList";
import { Division } from "@/features/division/types/Division";
import { Phase } from "@/features/division/types/Phase";
import { PhaseGroup } from "@/features/division/types/PhaseGroup";

type PhaseGroupCardProps = {
  phase: Phase;
  phaseGroup: PhaseGroup;
  division: Division;
  controls: boolean;
  tournamentId?: number;
  matchRefreshKey?: number;
};

export default function PhaseGroupCard({
  phase,
  phaseGroup,
  division,
  controls,
  tournamentId,
  matchRefreshKey,
}: PhaseGroupCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-gray-900">{phaseGroup.name}</p>
          <p className="text-xs text-gray-500">
            {phaseGroup.mode} • {phaseGroup.matchCount} match{phaseGroup.matchCount !== 1 ? "es" : ""}
          </p>
        </div>
        <span className="text-xs font-medium text-primary-dark">{expanded ? "Hide" : "Show"}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3">
          {phaseGroup.mode === "set-driven" ? (
            <MatchList
              division={division}
              controls={controls}
              tournamentId={tournamentId}
              matchUpdateSignal={matchRefreshKey}
              phaseId={phase.id}
              phaseGroupId={phaseGroup.id}
            />
          ) : (
            <div className="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
              This phase group is progression-driven. No set cards are available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
