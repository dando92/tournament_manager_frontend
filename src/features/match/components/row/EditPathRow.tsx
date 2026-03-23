import { Match } from "@/features/match/types/Match";
import { toOrdinal } from "@/shared/utils";

type EditPathRowProps = {
  allMatches: Match[];
  currentMatchId: number;
  maxPlayersPerMatch: number;
  value: string | null;
  onChange: (value: string | null) => void;
  onHighlightMatch: (id: number | null) => void;
};

export default function EditPathRow({ allMatches, currentMatchId, maxPlayersPerMatch, value, onChange, onHighlightMatch }: EditPathRowProps) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value || null;
    onChange(val);
    const matchId = val ? Number(val.split("-")[0]) : null;
    onHighlightMatch(matchId);
  }

  return (
    <tr className="border-t border-gray-100">
      <td className="px-3 py-2">
        <select
          value={value ?? ""}
          onChange={handleChange}
          className="w-full text-sm text-center border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="">— Select source match —</option>
          {allMatches
            .filter((m) => m.id !== currentMatchId)
            .flatMap((m) => {
              const taken = m.targetPaths?.length ?? 0;
              const available = maxPlayersPerMatch - taken;
              return Array.from({ length: Math.max(0, available) }, (_, i) => {
                const pos = taken + i + 1;
                return (
                  <option key={`${m.id}-${pos}`} value={`${m.id}-${pos}`}>
                    {toOrdinal(pos)} of {m.name}
                  </option>
                );
              });
            })}
        </select>
      </td>
    </tr>
  );
}
