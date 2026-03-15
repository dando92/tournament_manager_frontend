import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { Player } from "@/models/Player";
import { Account } from "@/models/Account";

type PlayersSection = {
  tournamentPlayers: Player[];
  availableToAdd: Player[];
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
};

type HelpersSection = {
  helpers: Account[];
  availableCandidates: Account[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  players: PlayersSection;
  helpers: HelpersSection;
  canEditHelpers: boolean;
};

export default function ManageParticipantsModal({
  open,
  onClose,
  players,
  helpers,
  canEditHelpers,
}: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedHelperId, setSelectedHelperId] = useState("");

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
            <div className="inline-block w-full max-w-3xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title as="h3" className="text-lg font-semibold text-rossoTesto">
                  Participants
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-row gap-6">
                {/* Players section */}
                <div className="flex-1">
                  <h4 className="font-semibold text-rossoTesto mb-2">Players</h4>

                  {players.availableToAdd.length > 0 && (
                    <select
                      className="border rounded px-2 py-1 text-sm w-full mb-2"
                      value={selectedPlayerId}
                      onChange={(e) => {
                        if (e.target.value) {
                          players.onAdd(Number(e.target.value));
                          setSelectedPlayerId("");
                        } else {
                          setSelectedPlayerId(e.target.value);
                        }
                      }}
                    >
                      <option value="" disabled>
                        Add player...
                      </option>
                      {players.availableToAdd.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.playerName}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                    {players.tournamentPlayers.length === 0 && (
                      <p className="text-sm text-gray-500">No players assigned yet.</p>
                    )}
                    {players.tournamentPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-row items-center justify-between bg-gray-50 px-3 py-2 rounded"
                      >
                        <span className="text-sm font-medium">{p.playerName}</span>
                        <button
                          onClick={() => players.onRemove(p.id)}
                          className="text-red-500 text-sm hover:underline"
                          title="Remove from tournament"
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Helpers section */}
                <div className="flex-1">
                  <h4 className="font-semibold text-rossoTesto mb-2">Tournament Helpers</h4>

                  {canEditHelpers && helpers.availableCandidates.length > 0 && (
                    <select
                      className="border rounded px-2 py-1 text-sm w-full mb-2"
                      value={selectedHelperId}
                      onChange={(e) => {
                        if (e.target.value) {
                          helpers.onAdd(e.target.value);
                          setSelectedHelperId("");
                        } else {
                          setSelectedHelperId(e.target.value);
                        }
                      }}
                    >
                      <option value="" disabled>
                        Add helper...
                      </option>
                      {helpers.availableCandidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.username}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                    {helpers.helpers.length === 0 && (
                      <p className="text-sm text-gray-500">No helpers assigned yet.</p>
                    )}
                    {helpers.helpers.map((h) => (
                      <div
                        key={h.id}
                        className="flex flex-row items-center justify-between bg-gray-50 px-3 py-2 rounded"
                      >
                        <span className="text-sm font-medium">{h.username}</span>
                        {canEditHelpers && (
                          <button
                            onClick={() => helpers.onRemove(h.id)}
                            className="text-red-500 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
