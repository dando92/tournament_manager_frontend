import { useEffect, useState } from "react";
import { Player } from "@/features/player/types/Player";
import { getAllPlayers } from "@/features/player/services/player.api";
import { btnPrimary } from "@/styles/buttonStyles";
import BaseModal from "@/shared/components/ui/BaseModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

type Props = {
  open: boolean;
  currentPlayerIds: Set<number>;
  onAssign: (playerId: number, player: Player) => Promise<void>;
  onClose: () => void;
};

export default function AddPlayerModal({ open, currentPlayerIds, onAssign, onClose }: Props) {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAllPlayers()
      .then(setAllPlayers)
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = allPlayers
    .filter((p) => !currentPlayerIds.has(p.id))
    .filter((p) => p.playerName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  async function handleAssign(player: Player) {
    setAssigning(player.id);
    try {
      await onAssign(player.id, player);
    } finally {
      setAssigning(null);
    }
  }

  return (
    <BaseModal open={open} onClose={onClose} title="Add player to division" maxWidth="max-w-md">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/30"
          />
        </div>

        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 italic py-2">Loading players…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-2">No players found.</p>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
              >
                <span>{p.playerName}</span>
                <button
                  onClick={() => handleAssign(p)}
                  disabled={assigning === p.id}
                  className={`${btnPrimary} text-xs py-1 px-3`}
                >
                  {assigning === p.id ? "Adding…" : "Add"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </BaseModal>
  );
}
