import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faLink, faPlug, faSatelliteDish } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary } from "@/styles/buttonStyles";
import HeaderActionModal from "./HeaderActionModal";

type Props = {
  tournamentId: number;
  syncstartUrl: string;
  setSyncstartUrl: Dispatch<SetStateAction<string>>;
};

export default function TournamentHeaderLobbyManageMenu({
  tournamentId,
  syncstartUrl,
  setSyncstartUrl,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [createLobbyModalOpen, setCreateLobbyModalOpen] = useState(false);
  const [connectLobbyModalOpen, setConnectLobbyModalOpen] = useState(false);
  const [syncstartDraft, setSyncstartDraft] = useState(syncstartUrl);
  const [savingUrl, setSavingUrl] = useState(false);
  const [creatingLobby, setCreatingLobby] = useState(false);
  const [connectingLobby, setConnectingLobby] = useState(false);
  const [createLobbyName, setCreateLobbyName] = useState("");
  const [createLobbyPassword, setCreateLobbyPassword] = useState("");
  const [connectLobbyName, setConnectLobbyName] = useState("");
  const [connectLobbyCode, setConnectLobbyCode] = useState("");
  const [connectLobbyPassword, setConnectLobbyPassword] = useState("");

  useEffect(() => {
    setSyncstartDraft(syncstartUrl);
  }, [syncstartUrl]);

  async function handleSaveUrl() {
    setSavingUrl(true);
    try {
      await axios.patch(`tournaments/${tournamentId}`, { syncstartUrl: syncstartDraft.trim() });
      setSyncstartUrl(syncstartDraft.trim());
      setUrlModalOpen(false);
      toast.success("Lobby URL saved.");
    } catch {
      toast.error("Failed to save lobby URL.");
    } finally {
      setSavingUrl(false);
    }
  }

  async function handleCreateLobby() {
    if (!syncstartDraft.trim() && !syncstartUrl.trim()) {
      toast.error("Set the lobby URL before creating a lobby.");
      return;
    }

    setCreatingLobby(true);
    try {
      await axios.post(`tournaments/${tournamentId}/lobbies/create`, {
        name: createLobbyName.trim() || undefined,
        password: createLobbyPassword,
      });
      setCreateLobbyName("");
      setCreateLobbyPassword("");
      setCreateLobbyModalOpen(false);
      toast.success("Lobby created.");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to create lobby.";
      toast.error(message);
    } finally {
      setCreatingLobby(false);
    }
  }

  async function handleConnectLobby() {
    if (!connectLobbyCode.trim()) {
      toast.error("Lobby code is required.");
      return;
    }

    setConnectingLobby(true);
    try {
      await axios.post(`tournaments/${tournamentId}/lobbies/connect`, {
        name: connectLobbyName.trim() || connectLobbyCode.trim().toUpperCase(),
        lobbyCode: connectLobbyCode.trim().toUpperCase(),
        password: connectLobbyPassword,
      });
      setConnectLobbyName("");
      setConnectLobbyCode("");
      setConnectLobbyPassword("");
      setConnectLobbyModalOpen(false);
      toast.success("Connected to lobby.");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to connect to lobby.";
      toast.error(message);
    } finally {
      setConnectingLobby(false);
    }
  }

  return (
    <>
      <HeaderActionModal
        open={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        title="Set lobby url"
        description="Configure the SyncStart websocket endpoint used for lobby management."
        confirmLabel="Save"
        loading={savingUrl}
        onConfirm={() => {
          handleSaveUrl().catch(() => {});
        }}
      >
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="ws://syncservice.groovestats.com:1337"
          value={syncstartDraft}
          onChange={(event) => setSyncstartDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSaveUrl().catch(() => {});
            }
          }}
        />
      </HeaderActionModal>

      <HeaderActionModal
        open={createLobbyModalOpen}
        onClose={() => setCreateLobbyModalOpen(false)}
        title="Create lobby"
        description="Create a new SyncStart lobby that players can join from their machines."
        confirmLabel="Create lobby"
        loading={creatingLobby}
        onConfirm={() => {
          handleCreateLobby().catch(() => {});
        }}
      >
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Lobby name"
          value={createLobbyName}
          onChange={(event) => setCreateLobbyName(event.target.value)}
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Password (optional)"
          type="password"
          value={createLobbyPassword}
          onChange={(event) => setCreateLobbyPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleCreateLobby().catch(() => {});
            }
          }}
        />
      </HeaderActionModal>

      <HeaderActionModal
        open={connectLobbyModalOpen}
        onClose={() => setConnectLobbyModalOpen(false)}
        title="Connect to lobby"
        description="Attach Tournament Manager to an existing SyncStart lobby."
        confirmLabel="Connect"
        loading={connectingLobby}
        onConfirm={() => {
          handleConnectLobby().catch(() => {});
        }}
      >
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Display name"
          value={connectLobbyName}
          onChange={(event) => setConnectLobbyName(event.target.value)}
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase"
          placeholder="Lobby code"
          value={connectLobbyCode}
          onChange={(event) => setConnectLobbyCode(event.target.value.toUpperCase())}
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Password (optional)"
          type="password"
          value={connectLobbyPassword}
          onChange={(event) => setConnectLobbyPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleConnectLobby().catch(() => {});
            }
          }}
        />
      </HeaderActionModal>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className={`flex items-center gap-2 ${btnPrimary}`}
        >
          Manage
          <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[190px]">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setUrlModalOpen(true);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faLink} className="text-primary-dark" />
                Set lobby url
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setCreateLobbyModalOpen(true);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faSatelliteDish} className="text-primary-dark" />
                Create lobby
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConnectLobbyModalOpen(true);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faPlug} className="text-primary-dark" />
                Connect to lobby
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
