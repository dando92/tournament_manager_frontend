import { Match } from "@/features/match/types/Match";
import { toOrdinal } from "@/shared/utils";
import { useEffect, useState } from "react";

type EditPathRowProps = {
  allMatches: Match[];
  currentMatchId: number;
  maxPlayersPerMatch: number;
  value: string | null;
  onChange: (value: string | null) => void;
  onHighlightMatch: (id: number | null) => void;
};

function parseValue(v: string | null): { matchId: number | null; position: number | null } {
  if (!v) return { matchId: null, position: null };
  const parts = v.split("-");
  return { matchId: Number(parts[0]), position: Number(parts[1]) };
}

export default function EditPathRow({ allMatches, currentMatchId, maxPlayersPerMatch, value, onChange, onHighlightMatch }: EditPathRowProps) {
  const { matchId: initMatchId, position: initPosition } = parseValue(value);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(initMatchId);

  // Sync local match selection when value is reset externally (e.g. cancel)
  useEffect(() => {
    const { matchId } = parseValue(value);
    setSelectedMatchId(matchId);
  }, [value]);

  const selectedPosition = parseValue(value).position;

  const availableMatches = allMatches.filter((m) => {
    if (m.id === currentMatchId) return false;
    const taken = m.targetPaths?.length ?? 0;
    // Include matches with open slots, or the currently selected match (for editing)
    return taken < maxPlayersPerMatch || m.id === selectedMatchId;
  });

  const selectedMatch = allMatches.find((m) => m.id === selectedMatchId) ?? null;
  const takenForSelected = selectedMatch?.targetPaths?.length ?? 0;

  const availablePositions = selectedMatch
    ? Array.from({ length: maxPlayersPerMatch }, (_, i) => i + 1).filter((pos) => {
        const isCurrentValue = selectedMatchId === initMatchId && pos === initPosition;
        return pos > takenForSelected || isCurrentValue;
      })
    : [];

  function handleMatchChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const matchId = e.target.value ? Number(e.target.value) : null;
    setSelectedMatchId(matchId);
    onHighlightMatch(matchId);
    onChange(null);
  }

  function handlePositionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const position = e.target.value ? Number(e.target.value) : null;
    if (selectedMatchId && position) {
      onChange(`${selectedMatchId}-${position}`);
    } else {
      onChange(null);
    }
  }

  return (
    <tr className="border-t border-gray-100">
      <td className="px-3 py-2">
        <div className="flex gap-2">
          <select
            value={selectedMatchId ?? ""}
            onChange={handleMatchChange}
            className="flex-1 text-sm text-center border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">— Select match —</option>
            {availableMatches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={selectedPosition ?? ""}
            onChange={handlePositionChange}
            disabled={!selectedMatchId}
            className="w-28 text-sm text-center border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">— Place —</option>
            {availablePositions.map((pos) => (
              <option key={pos} value={pos}>
                {toOrdinal(pos)}
              </option>
            ))}
          </select>
        </div>
      </td>
    </tr>
  );
}
