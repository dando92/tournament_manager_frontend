import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

type UseTournamentHeaderLobbyManageMenuOptions = {
  tournamentId: number;
  syncstartUrl: string;
  setSyncstartUrl: Dispatch<SetStateAction<string>>;
};

export function useTournamentHeaderLobbyManageMenu({
  tournamentId,
  syncstartUrl,
  setSyncstartUrl,
}: UseTournamentHeaderLobbyManageMenuOptions) {
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

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((value) => !value);
  const openUrlModal = () => {
    closeMenu();
    setUrlModalOpen(true);
  };
  const openCreateLobbyModal = () => {
    closeMenu();
    setCreateLobbyModalOpen(true);
  };
  const openConnectLobbyModal = () => {
    closeMenu();
    setConnectLobbyModalOpen(true);
  };

  const handleSaveUrl = async () => {
    setSavingUrl(true);
    try {
      const nextUrl = syncstartDraft.trim();
      await axios.patch(`tournaments/${tournamentId}`, { syncstartUrl: nextUrl });
      setSyncstartUrl(nextUrl);
      setUrlModalOpen(false);
      toast.success("Lobby URL saved.");
    } catch {
      toast.error("Failed to save lobby URL.");
    } finally {
      setSavingUrl(false);
    }
  };

  const handleCreateLobby = async () => {
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
  };

  const handleConnectLobby = async () => {
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
  };

  return {
    menuOpen,
    urlModalOpen,
    createLobbyModalOpen,
    connectLobbyModalOpen,
    syncstartDraft,
    savingUrl,
    creatingLobby,
    connectingLobby,
    createLobbyName,
    createLobbyPassword,
    connectLobbyName,
    connectLobbyCode,
    connectLobbyPassword,
    setUrlModalOpen,
    setCreateLobbyModalOpen,
    setConnectLobbyModalOpen,
    setSyncstartDraft,
    setCreateLobbyName,
    setCreateLobbyPassword,
    setConnectLobbyName,
    setConnectLobbyCode,
    setConnectLobbyPassword,
    toggleMenu,
    closeMenu,
    openUrlModal,
    openCreateLobbyModal,
    openConnectLobbyModal,
    handleSaveUrl,
    handleCreateLobby,
    handleConnectLobby,
  };
}
