import { useState } from "react";
import { Division } from "@/features/division/types/Division";
import { Player } from "@/features/player/types/Player";
import {
  bulkAddToDivision,
  removeFromDivision,
  assignPlayerToDivision,
} from "@/features/player/services/player.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary, btnSecondary } from "@/styles/buttonStyles";
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

  return (
    <div className="flex flex-col gap-6">
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded px-3 py-2 text-sm text-yellow-800">
          The following players already existed and were linked:{" "}
          <span className="font-semibold">{warnings.join(", ")}</span>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Players ({players.length})</h3>
        {players.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No players in this division.</p>
        ) : (
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {[...players]
              .sort((a, b) => a.playerName.localeCompare(b.playerName))
              .map((p) => (
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

      {canEdit && (
        <div className="flex gap-2">
          <button className={`${btnPrimary} text-sm`} onClick={() => setShowAddModal(true)}>
            Add player
          </button>
          <button className={`${btnSecondary} text-sm`} onClick={() => setShowBulkModal(true)}>
            Bulk import
          </button>
        </div>
      )}

      {showAddModal && (
        <AddPlayerModal
          currentPlayerIds={new Set(players.map((p) => p.id))}
          onAssign={handleAssign}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showBulkModal && (
        <BulkImportModal
          onImport={handleBulkImport}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </div>
  );
}
