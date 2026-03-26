import { useState } from "react";
import { Division } from "@/features/division/types/Division";
import { Player } from "@/features/player/types/Player";
import { bulkAddToDivision, removeFromDivision } from "@/features/player/services/player.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary } from "@/styles/buttonStyles";

type Props = {
  division: Division;
  canEdit: boolean;
  onPlayersChanged: () => void;
};

export default function PlayersTab({ division, canEdit, onPlayersChanged }: Props) {
  const [players, setPlayers] = useState<Player[]>(division.players ?? []);
  const [singleName, setSingleName] = useState("");
  const [bulkNames, setBulkNames] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAdd(names: string[]) {
    if (names.length === 0) return;
    setLoading(true);
    try {
      const result = await bulkAddToDivision(division.id, names);
      setPlayers((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPlayers = result.players.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPlayers];
      });
      setWarnings(result.warnings);
      onPlayersChanged();
    } catch {
      // error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(playerId: number) {
    try {
      await removeFromDivision(division.id, playerId);
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      setWarnings([]);
      onPlayersChanged();
    } catch {
      // error handled by axios interceptor
    }
  }

  function handleSingleAdd() {
    const name = singleName.trim();
    if (!name) return;
    setSingleName("");
    handleAdd([name]);
  }

  function handleBulkAdd() {
    const names = bulkNames
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    setBulkNames("");
    handleAdd(names);
  }

  return (
    <div className="flex flex-col gap-6">
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded px-3 py-2 text-sm text-yellow-800">
          The following players already existed and were linked:{" "}
          <span className="font-semibold">{warnings.join(", ")}</span>
        </div>
      )}

      {/* Current players list */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Players ({players.length})
        </h3>
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
        <>
          {/* Single add */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Add player</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSingleAdd()}
                placeholder="Player name"
                className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent"
              />
              <button
                onClick={handleSingleAdd}
                disabled={loading || !singleName.trim()}
                className={`${btnPrimary} text-sm px-4 py-1.5`}
              >
                Add
              </button>
            </div>
          </div>

          {/* Bulk add */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Bulk add</h3>
            <textarea
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              placeholder={"One name per line\nAlice\nBob\nCharlie"}
              rows={5}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent resize-none"
            />
            <button
              onClick={handleBulkAdd}
              disabled={loading || !bulkNames.trim()}
              className={`${btnPrimary} text-sm px-4 py-1.5 mt-2`}
            >
              {loading ? "Adding..." : "Add all"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
