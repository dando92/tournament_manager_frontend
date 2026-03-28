import { useState } from "react";
import { Division } from "@/features/division/types/Division";
import { Player } from "@/features/player/types/Player";
import {
  bulkAddToDivision,
  removeFromDivision,
  assignPlayerToDivision,
} from "@/features/player/services/player.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faSearch, faPlus, faFileImport } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary } from "@/styles/buttonStyles";
import AddPlayerModal from "./AddPlayerModal";
import BulkImportModal from "./BulkImportModal";

type Props = {
  division: Division;
  canEdit: boolean;
  onPlayersChanged: () => void;
};

export default function PlayersTab({ division, canEdit, onPlayersChanged }: Props) {
  const [players, setPlayers] = useState<Player[]>(division.players ?? []);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [search, setSearch] = useState("");

  async function handleAssign(playerId: number, player: Player) {
    try {
      await assignPlayerToDivision(playerId, division.id);
      setPlayers((prev) => (prev.some((p) => p.id === playerId) ? prev : [...prev, player]));
      setWarnings([]);
      onPlayersChanged();
    } catch {
      // handled by axios interceptor
    }
  }

  async function handleBulkImport(names: string[]) {
    if (names.length === 0) return;
    const result = await bulkAddToDivision(division.id, names);
    setPlayers((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newPlayers = result.players.filter((p) => !existingIds.has(p.id));
      return [...prev, ...newPlayers];
    });
    setWarnings(result.warnings);
    onPlayersChanged();
  }

  async function handleRemove(playerId: number) {
    try {
      await removeFromDivision(playerId, division.id);
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      setWarnings([]);
      onPlayersChanged();
    } catch {
      // handled by axios interceptor
    }
  }

  const filtered = [...players]
    .filter((p) => p.playerName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <AddPlayerModal
        open={showAddModal}
        currentPlayerIds={new Set(players.map((p) => p.id))}
        onAssign={handleAssign}
        onClose={() => setShowAddModal(false)}
      />
      <BulkImportModal
        open={showBulkModal}
        onImport={handleBulkImport}
        onClose={() => setShowBulkModal(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-primary-dark font-bold text-xl">Players</h2>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className={`${btnPrimary} flex items-center gap-1.5 text-sm`}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span className="hidden sm:inline">Add player</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className={`${btnPrimary} flex items-center gap-1.5 text-sm`}
            >
              <FontAwesomeIcon icon={faFileImport} />
              <span className="hidden sm:inline">Bulk import</span>
            </button>
          </div>
        )}
      </div>

      {/* Search bar */}
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

      {/* Player list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          {players.length === 0 ? "No players in this division." : "No players match your search."}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
            >
              <span>{p.playerName}</span>
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
          ))}
        </div>
      )}
    </div>
  );
}
