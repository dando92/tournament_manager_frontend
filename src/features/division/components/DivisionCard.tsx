import { TournamentDivisionOption } from "@/features/tournament/types/TournamentDivisionOption";
import { entrantPlayer } from "@/features/entrant/types/Entrant";
import { Player } from "@/features/player/types/Player";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { btnTrash } from "@/styles/buttonStyles";

type DivisionCardProps = {
  division: TournamentDivisionOption;
  onSelect: () => void;
  controls?: boolean;
  onDelete?: () => void;
};

const MAX_VISIBLE_PLAYERS = 3;
const MAX_VISIBLE_PHASES = 4;

export default function DivisionCard({ division, onSelect, controls = false, onDelete }: DivisionCardProps) {
  const players = (division.entrants ?? []).map(entrantPlayer).filter((player): player is Player => Boolean(player));
  const visiblePlayers = players.slice(0, MAX_VISIBLE_PLAYERS);
  const extraPlayers = players.length - visiblePlayers.length;
  const visiblePhases = division.phases?.slice(0, MAX_VISIBLE_PHASES) ?? [];
  const extraPhases = (division.phases?.length ?? 0) - visiblePhases.length;
  const totalMatchCount = (division.phases ?? []).reduce((count, phase) => count + phase.matchCount, 0);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-primary px-4 py-3">
        <h3 className="text-base font-bold leading-tight text-white">{division.name}</h3>
        {controls && onDelete && (
          <button
            type="button"
            title="Delete division"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className={`text-sm ${btnTrash}`}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>

      <button type="button" onClick={onSelect} className="border-b border-gray-100 px-4 py-3 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-xs font-semibold text-primary-dark">Entrants</span>
          {visiblePlayers.length === 0 ? (
            <span className="text-xs italic text-gray-400">No entrants</span>
          ) : (
            <>
              {visiblePlayers.map((player, index) => (
                <span key={player.id} className="text-xs text-gray-700">
                  {player.playerName}
                  {index < visiblePlayers.length - 1 && <span className="ml-1 text-gray-300">|</span>}
                </span>
              ))}
              {extraPlayers > 0 && <span className="text-xs text-primary-dark/70">+{extraPlayers} more</span>}
            </>
          )}
        </div>
      </button>

      <button type="button" onClick={onSelect} className="flex-1 px-4 py-3 text-left">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-xs font-semibold text-primary-dark">Phases</span>
          <div className="min-w-0 flex flex-col gap-1">
            {visiblePhases.length === 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-600">
                  {totalMatchCount > 0 ? `${totalMatchCount} match${totalMatchCount !== 1 ? "es" : ""}` : "No phases yet"}
                </span>
              </div>
            ) : (
              <>
                {visiblePhases.map((phase) => (
                  <div key={phase.id} className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">•</span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-gray-800">{phase.name}</span>
                      <span className="ml-1 text-xs text-gray-400">
                        {phase.type} • {phase.matchCount} match{phase.matchCount !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </div>
                ))}
                {extraPhases > 0 && <span className="pl-4 text-xs text-gray-400">+{extraPhases} more</span>}
              </>
            )}
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="flex items-center justify-center border-t border-gray-100 px-4 py-3"
      >
        <span className="inline-flex items-center justify-center text-sm font-medium text-primary-dark">
          Open division
        </span>
      </button>
    </div>
  );
}
