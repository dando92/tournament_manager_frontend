import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { btnPrimary } from "@/utils/buttonStyles";

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
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[9999] overflow-y-auto"
        onClose={onClose}
      >
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
            <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title as="h3" className="text-lg font-semibold text-rossoTesto">
                  Generate Bracket
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bracket type</label>
                  <select
                    className="border rounded px-2 py-1 text-sm w-full"
                    value={selectedBracketType}
                    onChange={(e) => setSelectedBracketType(e.target.value)}
                  >
                    {bracketTypes.map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
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

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
                  >
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
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
