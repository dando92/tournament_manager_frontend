import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faMinus } from "@fortawesome/free-solid-svg-icons";
import { Participant } from "@/features/entrant/types/Entrant";

type PlayersSeedingListProps = {
  canEdit: boolean;
  editingSeeding: boolean;
  draftSeeding: number[];
  seededPlayers: Participant[];
  seedPos: (participantId: number) => number | null;
  onDragEnd: (result: DropResult) => void;
  onRemove: (participantId: number) => void;
};

export default function PlayersSeedingList({
  canEdit,
  editingSeeding,
  draftSeeding,
  seededPlayers,
  seedPos,
  onDragEnd,
  onRemove,
}: PlayersSeedingListProps) {
  return (
    <>
      {editingSeeding ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="seeding">
            {(provided) => (
              <div className="flex flex-col gap-1" ref={provided.innerRef} {...provided.droppableProps}>
                {seededPlayers.map((participant, idx) => (
                  <Draggable key={participant.id} draggableId={String(participant.id)} index={idx}>
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
                          #{draftSeeding.indexOf(participant.id) + 1}
                        </span>
                        <span className="flex-1">{participant.player.playerName}</span>
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
          {seededPlayers.map((participant) => {
            const pos = seedPos(participant.id);
            return (
              <div
                key={participant.id}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  {pos !== null ? (
                    <span className="text-xs font-bold text-primary-dark w-7 shrink-0">#{pos}</span>
                  ) : (
                    <span className="w-7 shrink-0" />
                  )}
                  <span>{participant.player.playerName}</span>
                </div>
                {canEdit && (
                  <button
                    onClick={() => onRemove(participant.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                    title="Remove entrant"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </>
  );
}
