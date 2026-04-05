import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Player } from "@/features/player/types/Player";

type PlayersByNameListProps = {
  players: Player[];
  canEdit: boolean;
  divPlayerIds: Set<number>;
  seedPos: (playerId: number) => number | null;
  onAdd: (player: Player) => void;
  onRemove: (playerId: number) => void;
  totalPlayers: number;
};

export default function PlayersByNameList({
  players,
  canEdit,
  divPlayerIds,
  seedPos,
  onAdd,
  onRemove,
  totalPlayers,
}: PlayersByNameListProps) {
  if (players.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        {totalPlayers === 0 ? "No players available." : "No players match your search."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {players.map((player) => {
        const inDiv = divPlayerIds.has(player.id);
        const pos = inDiv ? seedPos(player.id) : null;

        return (
          <div
            key={player.id}
            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
          >
            <div className="flex items-center gap-2">
              {pos !== null ? (
                <span className="text-xs font-bold text-primary-dark w-7 shrink-0">#{pos}</span>
              ) : (
                <span className="w-7 shrink-0" />
              )}
              <span className={inDiv ? "" : "text-gray-400"}>{player.playerName}</span>
            </div>
            {canEdit && (
              inDiv ? (
                <button
                  onClick={() => onRemove(player.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Remove from division"
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              ) : (
                <button
                  onClick={() => onAdd(player)}
                  className="text-green-600 hover:text-green-800 ml-2"
                  title="Add to division"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
