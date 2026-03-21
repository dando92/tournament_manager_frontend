import { Match } from "@/models/Match";

type EditPathRowProps = {
  allMatches: Match[];
  currentMatchId: number;
  value: number | null;
  onChange: (matchId: number | null) => void;
  onHighlightMatch: (id: number | null) => void;
};

export default function EditPathRow({ allMatches, currentMatchId, value, onChange, onHighlightMatch }: EditPathRowProps) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const matchId = e.target.value ? Number(e.target.value) : null;
    onChange(matchId);
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
            .map((m) => (
              <option key={m.id} value={m.id}>
                Winner of Match {m.name}
              </option>
            ))}
        </select>
      </td>
    </tr>
  );
}
