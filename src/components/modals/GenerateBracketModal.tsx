import { useState } from "react";
import BaseModal from "@/components/modals/BaseModal";
import { btnPrimary } from "@/styles/buttonStyles";

type Props = {
  open: boolean;
  onClose: () => void;
  bracketTypes: string[];
  onGenerate: (bracketType: string, playerPerMatch: number) => Promise<void>;
};

export default function GenerateBracketModal({
  open,
  onClose,
  bracketTypes,
  onGenerate,
}: Props) {
  const [selectedBracketType, setSelectedBracketType] = useState(bracketTypes[0] ?? "");
  const [playerPerMatch, setPlayerPerMatch] = useState(2);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!selectedBracketType) return;
    setGenerating(true);
    try {
      await onGenerate(selectedBracketType, playerPerMatch);
      onClose();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Generate Bracket"
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded border hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedBracketType}
            className={`text-sm ${btnPrimary}`}
          >
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bracket type</label>
          <select
            className="border rounded px-2 py-1 text-sm w-full"
            value={selectedBracketType}
            onChange={(e) => setSelectedBracketType(e.target.value)}
          >
            {bracketTypes.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Players per match</label>
          <input
            type="number"
            min={2}
            value={playerPerMatch}
            onChange={(e) => setPlayerPerMatch(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </div>
      </div>
    </BaseModal>
  );
}
