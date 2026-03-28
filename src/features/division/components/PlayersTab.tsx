import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Division } from "@/features/division/types/Division";
import { Player } from "@/features/player/types/Player";
import {
  getAllPlayers,
  bulkAddToDivision,
  removeFromDivision,
  assignPlayerToDivision,
  updateDivisionSeeding,
} from "@/features/player/services/player.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faSearch, faPlus, faFileImport, faGripVertical, faSortAmountDown } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary, btnSecondary } from "@/styles/buttonStyles";
import BulkImportModal from "./BulkImportModal";

type Ordering = "name" | "seeding";

type Props = {
  division: Division;
  canEdit: boolean;
  onPlayersChanged: () => void;
};

export default function PlayersTab({ division, canEdit, onPlayersChanged }: Props) {
  const [divPlayers, setDivPlayers] = useState<Player[]>(division.players ?? []);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [localSeeding, setLocalSeeding] = useState<number[]>(division.seeding ?? []);
  const [ordering, setOrdering] = useState<Ordering>("seeding");
  const [editingSeeding, setEditingSeeding] = useState(false);
  const [draftSeeding, setDraftSeeding] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [savingSeeding, setSavingSeeding] = useState(false);

  useEffect(() => {
    getAllPlayers().then(setAllPlayers).catch(() => {});
  }, []);

  const divPlayerIds = new Set(divPlayers.map((p) => p.id));

  // The ordering in use: draft while editing, saved otherwise
  const activeSeeding = editingSeeding ? draftSeeding : localSeeding;

  const seededDivPlayers = [...divPlayers].sort((a, b) => {
    const ai = activeSeeding.indexOf(a.id);
    const bi = activeSeeding.indexOf(b.id);
    return (ai === -1 ? divPlayers.length : ai) - (bi === -1 ? divPlayers.length : bi);
  });

  const nonDivPlayers = allPlayers
    .filter((p) => !divPlayerIds.has(p.id))
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  const lowerSearch = search.toLowerCase();

  const filteredSeededDiv = seededDivPlayers.filter((p) =>
    p.playerName.toLowerCase().includes(lowerSearch),
  );
  const filteredNonDiv = nonDivPlayers.filter((p) =>
    p.playerName.toLowerCase().includes(lowerSearch),
  );
  const filteredAllAlpha = [...allPlayers]
    .filter((p) => p.playerName.toLowerCase().includes(lowerSearch))
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  function enterSeedingEdit() {
    setOrdering("seeding");
    setDraftSeeding([...localSeeding]);
    setEditingSeeding(true);
  }

  async function exitSeedingEdit() {
    setSavingSeeding(true);
    try {
      await updateDivisionSeeding(division.id, draftSeeding);
      setLocalSeeding(draftSeeding);
      onPlayersChanged();
    } finally {
      setSavingSeeding(false);
      setEditingSeeding(false);
    }
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    // Reorder within the visible (possibly filtered) subset
    const visibleIds = filteredSeededDiv.map((p) => p.id);
    const reordered = [...visibleIds];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Merge back into full draft: replace visible slots in order, keep non-visible in place
    const visibleSet = new Set(visibleIds);
    let vi = 0;
    setDraftSeeding(draftSeeding.map((id) => (visibleSet.has(id) ? reordered[vi++] : id)));
  }

  async function handleAdd(player: Player) {
    setDivPlayers((prev) => (prev.some((p) => p.id === player.id) ? prev : [...prev, player]));
    setLocalSeeding((prev) => (prev.includes(player.id) ? prev : [...prev, player.id]));
    if (editingSeeding) {
      setDraftSeeding((prev) => (prev.includes(player.id) ? prev : [...prev, player.id]));
    }
    try {
      await assignPlayerToDivision(player.id, division.id);
      setWarnings([]);
      onPlayersChanged();
    } catch {
      // revert on failure
      setDivPlayers((prev) => prev.filter((p) => p.id !== player.id));
      setLocalSeeding((prev) => prev.filter((id) => id !== player.id));
      if (editingSeeding) {
        setDraftSeeding((prev) => prev.filter((id) => id !== player.id));
      }
    }
  }

  async function handleRemove(playerId: number) {
    try {
      await removeFromDivision(playerId, division.id);
      setDivPlayers((prev) => prev.filter((p) => p.id !== playerId));
      // Filter out the removed player — remaining positions compact automatically
      setLocalSeeding((prev) => prev.filter((id) => id !== playerId));
      if (editingSeeding) {
        setDraftSeeding((prev) => prev.filter((id) => id !== playerId));
      }
      setWarnings([]);
      onPlayersChanged();
    } catch {
      // handled by axios interceptor
    }
  }

  async function handleBulkImport(names: string[]) {
    if (names.length === 0) return;
    const result = await bulkAddToDivision(division.id, names);
    setDivPlayers((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      return [...prev, ...result.players.filter((p) => !existingIds.has(p.id))];
    });
    const appendSeeding = (prev: number[]) => {
      const existing = new Set(prev);
      return [...prev, ...result.players.filter((p) => !existing.has(p.id)).map((p) => p.id)];
    };
    setLocalSeeding(appendSeeding);
    if (editingSeeding) setDraftSeeding(appendSeeding);
    setWarnings(result.warnings);
    onPlayersChanged();
  }

  const seedPos = (playerId: number) => {
    const idx = localSeeding.indexOf(playerId);
    return idx === -1 ? null : idx + 1;
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <BulkImportModal
        open={showBulkModal}
        onImport={handleBulkImport}
        onClose={() => setShowBulkModal(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-primary-dark font-bold text-xl">Players</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Ordering toggle — disabled while editing seeding */}
          <div className={`flex border border-gray-200 rounded overflow-hidden text-sm ${editingSeeding ? "opacity-40 pointer-events-none" : ""}`}>
            <button
              onClick={() => setOrdering("name")}
              className={`px-3 py-1.5 transition-colors ${
                ordering === "name" ? "bg-primary-dark text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              By name
            </button>
            <button
              onClick={() => setOrdering("seeding")}
              className={`px-3 py-1.5 transition-colors border-l border-gray-200 ${
                ordering === "seeding" ? "bg-primary-dark text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              By seeding
            </button>
          </div>

          {canEdit && (
            editingSeeding ? (
              <button
                onClick={exitSeedingEdit}
                disabled={savingSeeding}
                className={`${btnPrimary} flex items-center gap-1.5 text-sm`}
              >
                {savingSeeding ? "Saving…" : "Done"}
              </button>
            ) : (
              <button
                onClick={enterSeedingEdit}
                className={`${btnSecondary} flex items-center gap-1.5 text-sm`}
              >
                <FontAwesomeIcon icon={faSortAmountDown} />
                <span className="hidden sm:inline">Edit seeding</span>
              </button>
            )
          )}

          {canEdit && (
            <button
              onClick={() => setShowBulkModal(true)}
              className={`${btnPrimary} flex items-center gap-1.5 text-sm`}
            >
              <FontAwesomeIcon icon={faFileImport} />
              <span className="hidden sm:inline">Bulk import</span>
            </button>
          )}
        </div>
      </div>

      {/* Search bar — always visible */}
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
        />
        <input
          type="search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/30"
        />
      </div>

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded px-3 py-2 text-sm text-yellow-800">
          The following players already existed and were linked:{" "}
          <span className="font-semibold">{warnings.join(", ")}</span>
        </div>
      )}

      {ordering === "name" ? (
        /* ── By name ── */
        filteredAllAlpha.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            {allPlayers.length === 0 ? "No players available." : "No players match your search."}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredAllAlpha.map((p) => {
              const inDiv = divPlayerIds.has(p.id);
              const pos = inDiv ? seedPos(p.id) : null;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {pos !== null ? (
                      <span className="text-xs font-bold text-primary-dark w-7 shrink-0">#{pos}</span>
                    ) : (
                      <span className="w-7 shrink-0" />
                    )}
                    <span className={inDiv ? "" : "text-gray-400"}>{p.playerName}</span>
                  </div>
                  {canEdit && (
                    inDiv ? (
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove from division"
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdd(p)}
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
        )
      ) : (
        /* ── By seeding ── */
        <>
          {editingSeeding ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="seeding">
                {(provided) => (
                  <div className="flex flex-col gap-1" ref={provided.innerRef} {...provided.droppableProps}>
                    {filteredSeededDiv.map((p, idx) => (
                      <Draggable key={p.id} draggableId={String(p.id)} index={idx}>
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
                              #{draftSeeding.indexOf(p.id) + 1}
                            </span>
                            <span className="flex-1">{p.playerName}</span>
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
              {filteredSeededDiv.map((p) => {
                const pos = seedPos(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {pos !== null ? (
                        <span className="text-xs font-bold text-primary-dark w-7 shrink-0">#{pos}</span>
                      ) : (
                        <span className="w-7 shrink-0" />
                      )}
                      <span>{p.playerName}</span>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => handleRemove(p.id)}
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

          {/* Non-division players always show with + */}
          {canEdit && filteredNonDiv.length > 0 && (
            <div className="flex flex-col gap-1">
              {filteredNonDiv.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-100 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 shrink-0" />
                    <span className="text-gray-400">{p.playerName}</span>
                  </div>
                  <button
                    onClick={() => handleAdd(p)}
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
      )}
    </div>
  );
}
