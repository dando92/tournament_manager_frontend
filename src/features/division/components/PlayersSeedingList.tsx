import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Player } from "@/features/player/types/Player";

type PlayersSeedingListProps = {
  canEdit: boolean;
  editingSeeding: boolean;
  draftSeeding: number[];
  seededPlayers: Player[];
  nonDivisionPlayers: Player[];
  seedPos: (playerId: number) => number | null;
  onDragEnd: (result: DropResult) => void;
  onAdd: (player: Player) => void;
  onRemove: (playerId: number) => void;
};

export default function PlayersSeedingList({
  canEdit,
  editingSeeding,
  draftSeeding,
  seededPlayers,
  nonDivisionPlayers,
  seedPos,
  onDragEnd,
  onAdd,
  onRemove,
}: PlayersSeedingListProps) {
  return (
    <>
      {editingSeeding ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="seeding">
            {(provided) => (
              <div className="flex flex-col gap-1" ref={provided.innerRef} {...provided.droppableProps}>
                {seededPlayers.map((player, idx) => (
                  <Draggable key={player.id} draggableId={String(player.id)} index={idx}>
                    {(drag, snapshot) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className={`flex items-center gap-3 px-3 py-2 rounded border text-sm ${
                          snapshot.isDragging
                            ? "border-primary-dark bg-primary-dark/10 shadow-md"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <span className="w-7 text-xs font-bold text-primary-dark shrink-0">
                          #{draftSeeding.indexOf(player.id) + 1}
                        </span>
                        <span className="flex-1">{player.playerName}</span>
                        <span
                          {...drag.dragHandleProps}
                          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing px-1"
                        >
                          <FontAwesomeIcon icon={faGripVertical} />
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="flex flex-col gap-1">
          {seededPlayers.map((player) => {
            const pos = seedPos(player.id);
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
                  <span>{player.playerName}</span>
                </div>
                {canEdit && (
                  <button
                    onClick={() => onRemove(player.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                    title="Remove from division"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canEdit && nonDivisionPlayers.length > 0 && (
        <div className="flex flex-col gap-1">
          {nonDivisionPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-100 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 shrink-0" />
                <span className="text-gray-400">{player.playerName}</span>
              </div>
              <button
                onClick={() => onAdd(player)}
                className="text-green-600 hover:text-green-800 ml-2"
                title="Add to division"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
