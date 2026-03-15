import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type Props = {
  open: boolean;
  lobbyCode: string;
  onLobbyCodeChange: (value: string) => void;
  onSaveLobbyCode: () => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onConnect: () => void;
  onCancel: () => void;
};

export default function LobbyConnectMobileModal({
  open,
  lobbyCode,
  onLobbyCodeChange,
  onSaveLobbyCode,
  password,
  onPasswordChange,
  onConnect,
  onCancel,
}: Props) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[9999] overflow-y-auto" onClose={onCancel}>
        <div className="min-h-screen px-4 text-center bg-white bg-opacity-30">
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-lg bg-gray-500 bg-opacity-60" />
          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-sm p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title as="h3" className="text-lg font-semibold text-rossoTesto">
                  Connect to lobby
                </Dialog.Title>
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Lobby code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-rossoTesto"
                      value={lobbyCode}
                      onChange={(e) => onLobbyCodeChange(e.target.value)}
                      placeholder="e.g. ABC123"
                    />
                    <button
                      onClick={onSaveLobbyCode}
                      className="px-3 py-1.5 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Password (leave empty if none)</label>
                  <input
                    type="password"
                    className="border border-gray-300 rounded px-3 py-1.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-rossoTesto"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onConnect()}
                    autoFocus
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={onCancel}
                    className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConnect}
                    className="px-4 py-1.5 rounded text-sm bg-rossoTesto text-white hover:opacity-90"
                  >
                    Connect
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
