import { Division } from "@/features/division/types/Division";

type DivisionCardProps = {
  division: Division;
  onSelect: () => void;
};

const MAX_VISIBLE_PLAYERS = 3;
const MAX_VISIBLE_PHASES = 4;

export default function DivisionCard({ division, onSelect }: DivisionCardProps) {
  const visiblePlayers = division.players?.slice(0, MAX_VISIBLE_PLAYERS) ?? [];
  const extraPlayers = (division.players?.length ?? 0) - visiblePlayers.length;

  const visiblePhases = division.phases?.slice(0, MAX_VISIBLE_PHASES) ?? [];
  const extraPhases = (division.phases?.length ?? 0) - visiblePhases.length;

  const totalMatchCount = (division.phases ?? []).flatMap(p => p.matches ?? []).length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col text-left overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-primary border-b border-white/10">
        <h3 className="font-bold text-white text-base leading-tight">{division.name}</h3>
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
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-center">
        <span className="inline-flex items-center justify-center text-sm font-medium text-primary-dark">
          Open division
        </span>
      </div>
    </button>
  );
}
