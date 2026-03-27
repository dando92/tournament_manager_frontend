import { useState } from "react";
import { btnPrimary, btnSecondary } from "@/styles/buttonStyles";

type Props = {
  onImport: (names: string[]) => Promise<void>;
  onClose: () => void;
};

export default function BulkImportModal({ onImport, onClose }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  async function handleImport() {
    const names = text
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (names.length === 0) return;
    setLoading(true);
    setWarnings([]);
    try {
      await onImport(names);
      setText("");
      onClose();
    } catch {
      // handled by axios interceptor
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Bulk import players</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>

        <p className="text-sm text-gray-500">
          Enter one player name per line. Existing players will be linked; new ones will be created.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Alice\nBob\nCharlie"}
          rows={8}
          autoFocus
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent resize-none"
        />

        {warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded px-3 py-2 text-sm text-yellow-800">
            Already existed and linked: <span className="font-semibold">{warnings.join(", ")}</span>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={`${btnSecondary} text-sm`}>
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !text.trim()}
            className={`${btnPrimary} text-sm`}
          >
            {loading ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
