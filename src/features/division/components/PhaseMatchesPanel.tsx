import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import MatchList from "@/features/match/components/MatchList";
import PhaseGroupCard from "@/features/division/components/PhaseGroupCard";
import { Division } from "@/features/division/types/Division";
import { Phase } from "@/features/division/types/Phase";
import { btnTrash } from "@/styles/buttonStyles";

type PhaseMatchesPanelProps = {
  phase: Phase;
  division: Division;
  controls: boolean;
  tournamentId?: number;
  matchRefreshKey?: number;
  onDelete?: (phaseId: number) => Promise<void>;
};

export default function PhaseMatchesPanel({
  phase,
  division,
  controls,
  tournamentId,
  matchRefreshKey,
  onDelete,
}: PhaseMatchesPanelProps) {
  const matchCount = phase.matchCount ?? phase.phaseGroups.reduce((count, phaseGroup) => count + phaseGroup.matchCount, 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-sm font-semibold text-gray-700">{phase.name}</h4>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
          {phase.type}
        </span>
        <span className="text-xs text-gray-400">
          {matchCount} match{matchCount !== 1 ? "es" : ""}
        </span>
        {controls && onDelete && (
          <button
            type="button"
            title="Delete phase"
            onClick={async () => {
              if (!window.confirm(`Delete phase "${phase.name}"?`)) return;
              await onDelete(phase.id);
            }}
            className={`ml-auto text-sm ${btnTrash}`}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>
      {phase.type === "bracket" ? (
        <MatchList
          key={`phase-${phase.id}`}
          division={division}
          phaseId={phase.id}
          controls={controls}
          tournamentId={tournamentId}
          matchUpdateSignal={matchRefreshKey}
        />
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {phase.phaseGroups.length === 0 ? (
            <p className="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
              No phase groups in this pool phase yet.
            </p>
          ) : (
            phase.phaseGroups.map((phaseGroup) => (
              <PhaseGroupCard
                key={phaseGroup.id}
                phase={phase}
                phaseGroup={phaseGroup}
                division={division}
                controls={controls}
                tournamentId={tournamentId}
                matchRefreshKey={matchRefreshKey}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
