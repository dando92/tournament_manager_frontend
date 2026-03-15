import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";

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
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[9999] overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center bg-white bg-opacity-30">
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-lg bg-gray-500 bg-opacity-60" />
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                {mode === "add" ? "Add standing" : "Edit standing"}
              </Dialog.Title>
              <div className="mt-2">
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
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Percentage</label>
                    <input
                      type="text"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              </div>
              <div className="mt-6 flex flex-row gap-2 justify-between">
                <div>
                  {mode === "edit" && onDelete && (
                    <button
                      type="button"
                      className="bg-red-600 text-white px-3 py-2 rounded-lg"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="flex flex-row gap-2">
                  <button
                    type="button"
                    className="text-gray-600 px-3 py-2 rounded-lg hover:underline"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bg-middle text-white px-3 py-2 rounded-lg"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
