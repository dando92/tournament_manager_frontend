import { Division } from "@/models/Division";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiagramProject } from "@fortawesome/free-solid-svg-icons";

type DivisionCardProps = {
  division: Division;
  tournamentName: string;
  onSelect: () => void;
  onGenerateBracket?: () => void;
};

const MAX_VISIBLE_PLAYERS = 3;
const MAX_VISIBLE_PHASES = 4;

export default function DivisionCard({ division, tournamentName, onSelect, onGenerateBracket }: DivisionCardProps) {
  const visiblePlayers = division.players?.slice(0, MAX_VISIBLE_PLAYERS) ?? [];
  const extraPlayers = (division.players?.length ?? 0) - visiblePlayers.length;

  const visiblePhases = division.phases?.slice(0, MAX_VISIBLE_PHASES) ?? [];
  const extraPhases = (division.phases?.length ?? 0) - visiblePhases.length;

  const totalMatchCount = division.matches?.length ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-0.5">{tournamentName}</p>
        <h3 className="font-bold text-gray-900 text-base leading-tight">{division.name}</h3>
      </div>

      {/* Players */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-primary-dark shrink-0">Players</span>
          {visiblePlayers.length === 0 ? (
            <span className="text-xs text-gray-400 italic">No players</span>
          ) : (
            <>
              {visiblePlayers.map((p, i) => (
                <span key={p.id} className="text-xs text-gray-700">
                  {p.playerName}
                  {i < visiblePlayers.length - 1 && <span className="text-gray-300 ml-1">|</span>}
                </span>
              ))}
              {extraPlayers > 0 && (
                <span className="text-xs text-primary-dark/70">+{extraPlayers} more</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Brackets / Phases */}
      <div className="px-4 py-3 flex-1">
        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold text-primary-dark shrink-0 mt-0.5">Brackets</span>
          <div className="flex flex-col gap-1 min-w-0">
            {visiblePhases.length === 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-300 text-xs">◆</span>
                <span className="text-xs text-gray-600">
                  {totalMatchCount > 0 ? `${totalMatchCount} match${totalMatchCount !== 1 ? "es" : ""}` : "No bracket yet"}
                </span>
              </div>
            ) : (
              <>
                {visiblePhases.map((phase) => (
                  <div key={phase.id} className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-xs">◆</span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-gray-800">{phase.name}</span>
                      <span className="text-xs text-gray-400 ml-1">
                        {phase.matches?.length ?? 0} match{(phase.matches?.length ?? 0) !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </div>
                ))}
                {extraPhases > 0 && (
                  <span className="text-xs text-gray-400 pl-4">+{extraPhases} more</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        {onGenerateBracket && totalMatchCount === 0 ? (
          <button
            onClick={onGenerateBracket}
            className="w-full py-2 border border-green-300 text-green-700 text-sm font-medium rounded hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faDiagramProject} />
            Generate bracket
          </button>
        ) : (
          <button
            onClick={onSelect}
            className="w-full py-2 border border-primary-dark text-primary-dark text-sm font-medium rounded hover:bg-primary-dark/5 transition-colors"
          >
            View Bracket
          </button>
        )}
      </div>
    </div>
  );
}
