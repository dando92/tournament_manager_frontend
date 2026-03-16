import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { btnPrimary } from "@/utils/buttonStyles";
import axios from "axios";
import { toast } from "react-toastify";

type LobbyEntry = { id: string; name: string; lobbyCode: string };

type Props = {
  open: boolean;
  tournamentId: string;
  onClose: () => void;
};

export default function LobbiesModal({ open, tournamentId, onClose }: Props) {
  const [lobbies, setLobbies] = useState<LobbyEntry[]>([]);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!open) return;
    axios
      .get<LobbyEntry[]>(`tournaments/${tournamentId}/lobbies`)
      .then((r) => setLobbies(r.data))
      .catch(() => {});
  }, [open, tournamentId]);

  const handleConnect = async () => {
    if (!newCode.trim()) {
      toast.error("Lobby code is required.");
      return;
    }
    setConnecting(true);
    try {
      const res = await axios.post<{ id: string }>(
        `tournaments/${tournamentId}/lobbies/connect`,
        { name: newName || newCode, lobbyCode: newCode, password: newPassword },
      );
      setLobbies((prev) => [
        ...prev,
        { id: res.data.id, name: newName || newCode, lobbyCode: newCode },
      ]);
      setNewName("");
      setNewCode("");
      setNewPassword("");
      toast.success("Connected to lobby.");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to connect.";
      toast.error(msg);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (lobbyId: string) => {
    await axios
      .delete(`tournaments/${tournamentId}/lobbies/${lobbyId}/disconnect`)
      .catch(() => {});
    setLobbies((prev) => prev.filter((l) => l.id !== lobbyId));
    toast.success("Disconnected.");
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[9999] overflow-y-auto" onClose={onClose}>
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
            <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title as="h3" className="text-lg font-semibold text-rossoTesto">
                  Lobby connections
                </Dialog.Title>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                  ✕
                </button>
              </div>

              {/* Active lobbies */}
              {lobbies.length > 0 ? (
                <div className="flex flex-col gap-2 mb-4">
                  {lobbies.map((lobby) => (
                    <div
                      key={lobby.id}
                      className="flex items-center justify-between border border-gray-200 rounded px-3 py-2"
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {lobby.name}
                        <span className="ml-2 text-xs text-gray-400 font-normal">{lobby.lobbyCode}</span>
                      </span>
                      <button
                        onClick={() => handleDisconnect(lobby.id)}
                        className={`ml-4 shrink-0 text-xs ${btnPrimary}`}
                      >
                        Disconnect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">No active lobby connections.</p>
              )}

              {/* Add new lobby */}
              <div className="flex flex-col gap-2 border-t pt-4">
                <p className="text-sm font-semibold text-gray-600">Connect new lobby</p>
                <input
                  className="border rounded px-3 py-1.5 text-sm"
                  placeholder="Lobby name (optional)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <input
                  className="border rounded px-3 py-1.5 text-sm"
                  placeholder="Lobby code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
                <input
                  className="border rounded px-3 py-1.5 text-sm"
                  placeholder="Password (optional)"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleConnect(); }}
                />
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className={`text-sm ${btnPrimary}`}
                >
                  {connecting ? "Connecting..." : "Connect"}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
