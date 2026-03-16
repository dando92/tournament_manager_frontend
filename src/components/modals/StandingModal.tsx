import { useEffect, useState } from "react";
import BaseModal from "@/components/modals/BaseModal";
import { btnPrimary } from "@/styles/buttonStyles";

type StandingModalProps = {
  mode: "add" | "edit";
  open: boolean;
  playerName: string;
  songTitle: string;
  playerId: number;
  songId: number;
  initialPercentage?: number;
  initialScore?: number;
  initialIsFailed?: boolean;
  onClose: () => void;
  onSave: (
    playerId: number,
    songId: number,
    percentage: number,
    score: number,
    isFailed: boolean,
  ) => void;
  onDelete?: (playerId: number, songId: number) => void;
};

export default function StandingModal({
  mode,
  open,
  playerName,
  songTitle,
  playerId,
  songId,
  initialPercentage,
  initialScore,
  initialIsFailed,
  onClose,
  onSave,
  onDelete,
}: StandingModalProps) {
  const [percentage, setPercentage] = useState("0");
  const [score, setScore] = useState("0");
  const [isFailed, setIsFailed] = useState(false);

  useEffect(() => {
    if (open) {
      setPercentage(initialPercentage !== undefined ? String(initialPercentage) : "0");
      setScore(initialScore !== undefined ? String(initialScore) : "0");
      setIsFailed(initialIsFailed ?? false);
    }
  }, [open, initialPercentage, initialScore, initialIsFailed]);

  function handleSave() {
    onSave(
      playerId,
      songId,
      parseFloat(percentage.replace(",", ".")),
      parseInt(score),
      isFailed,
    );
    onClose();
  }

  function handleDelete() {
    onDelete?.(playerId, songId);
    onClose();
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={mode === "add" ? "Add standing" : "Edit standing"}
      footer={
        <div className="flex flex-row gap-2 justify-between">
          <div>
            {mode === "edit" && onDelete && (
              <button
                type="button"
                className="bg-red-600 text-white px-3 py-1.5 rounded hover:opacity-90"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex flex-row gap-2">
            <button
              type="button"
              className="text-gray-600 px-3 py-1.5 rounded hover:underline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="button" className={btnPrimary} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      }
    >
      <p className="text-sm text-gray-500 mb-4">
        {playerName} for {songTitle}
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Points</label>
          <input
            type="text"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rossoTesto focus:border-rossoTesto sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Percentage</label>
          <input
            type="text"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rossoTesto focus:border-rossoTesto sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFailed"
            checked={isFailed}
            onChange={(e) => setIsFailed(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="isFailed" className="text-sm font-medium text-gray-700">
            Failed
          </label>
        </div>
      </div>
    </BaseModal>
  );
}
