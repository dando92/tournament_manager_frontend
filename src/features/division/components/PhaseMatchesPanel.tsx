import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import MatchList from "@/features/match/components/MatchList";
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
  const matchCount = phase.matchCount ?? phase.matches?.length ?? 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-sm font-semibold text-gray-700">{phase.name}</h4>
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
