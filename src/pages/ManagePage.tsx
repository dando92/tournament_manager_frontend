import TournamentSettings from "../components/manage/tournament/TournamentSettings";
import LobbyPasswordModal from "../components/manage/tournament/LobbyPasswordModal";
import { useParams, useNavigate } from "react-router-dom";
import { faArrowLeft, faBroadcastTower, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useCallback } from "react";
import { useMatchHub } from "../services/useMatchHub";
import axios from "axios";
import { useAuthContext } from "../services/auth/AuthContext";
import { useHelpers } from "../services/helpers/useHelpers";
import { Player } from "../models/Player";
import ManageParticipantsModal from "../components/manage/ManageParticipantsModal";
import { toast } from "react-toastify";

export default function ManagePage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const [lobbyCode, setLobbyCode] = useState<string>("");
  const [lobbyPasswordModalOpen, setLobbyPasswordModalOpen] = useState(false);
  const [lobbyPasswordInput, setLobbyPasswordInput] = useState("");
  const [lobbyConnected, setLobbyConnected] = useState(false);
  const { state: authState } = useAuthContext();
  const account = authState.account;

  // Whether the current user is the specific owner of this tournament
  const [isTournamentOwner, setIsTournamentOwner] = useState(false);
  // Whether the current user is a helper of any tournament
  const [isHelper, setIsHelper] = useState(false);

  const isAdmin = account?.isAdmin ?? false;

  // Can manage helpers (add/remove): admin or the tournament's owner
  const canEditHelpers = isAdmin || isTournamentOwner;
  // Can use management controls: admin, tournament owner, or helper
  const canControl = isAdmin || isTournamentOwner || isHelper;

  const { state: helpersState, actions: helpersActions } = useHelpers(Number(tournamentId));

  const [matchUpdateSignal, setMatchUpdateSignal] = useState(0);
  const onMatchUpdate = useCallback(() => { setMatchUpdateSignal(s => s + 1); }, []);
  useMatchHub(onMatchUpdate, Number(tournamentId) || undefined);

  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [tournamentPlayers, setTournamentPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  // Fetch tournament name, lobbyCode, and determine if current user is its owner
  useEffect(() => {
    if (!tournamentId) return;
    axios
      .get<{ id: number; name: string; lobbyCode?: string | null; owner?: { id: string } }>(`tournaments/${tournamentId}`)
      .then((r) => {
        setLobbyCode(r.data.lobbyCode ?? "");
        document.title = `${r.data.name} — Tournament Manager`;
        if (account && r.data.owner?.id === account.id) {
          setIsTournamentOwner(true);
        }
      })
      .catch(() => {});

    axios
      .get<{ connected: boolean }>(`tournaments/${tournamentId}/lobby/status`)
      .then((r) => setLobbyConnected(r.data.connected))
      .catch(() => {});

    return () => {
      document.title = "Tournament Manager";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId, account?.id]);

  // Check helper status for non-admin users
  useEffect(() => {
    if (!account || isAdmin) return;
    axios
      .get<{ isHelper: boolean }>("tournaments/is-helper")
      .then((r) => setIsHelper(r.data.isHelper))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id, isAdmin]);

  // Load helpers list and players when we know the user can access this tournament
  useEffect(() => {
    if (!tournamentId || !canControl) return;
    helpersActions.load();
    axios
      .get<Player[]>(`tournaments/${tournamentId}/players`)
      .then((r) => setTournamentPlayers(r.data.sort((a, b) => a.playerName.localeCompare(b.playerName))))
      .catch(() => {});
    axios
      .get<Player[]>("players")
      .then((r) => setAllPlayers(r.data.sort((a, b) => a.playerName.localeCompare(b.playerName))))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId, canControl, canEditHelpers]);

  const availableCandidates = helpersState.candidates.filter(
    (c) => !helpersState.helpers.some((h) => h.id === c.id)
  );

  const availablePlayersToAdd = allPlayers.filter(
    (p) => !tournamentPlayers.some((tp) => tp.id === p.id)
  );

  const handleAddPlayer = (playerId: number) => {
    axios
      .post(`tournaments/${tournamentId}/players`, { playerId })
      .then(() => {
        const player = allPlayers.find((p) => p.id === playerId);
        if (player) {
          setTournamentPlayers((prev) =>
            [...prev, player].sort((a, b) => a.playerName.localeCompare(b.playerName))
          );
        }
        toast.success("Player added to tournament.");
      })
      .catch(() => toast.error("Failed to add player."));
  };

  const handleRemovePlayer = (playerId: number) => {
    if (!window.confirm("Remove this player from the tournament?")) return;
    axios
      .delete(`tournaments/${tournamentId}/players/${playerId}`)
      .then(() => {
        setTournamentPlayers((prev) => prev.filter((p) => p.id !== playerId));
        toast.success("Player removed from tournament.");
      })
      .catch(() => toast.error("Failed to remove player."));
  };

  const handleSaveLobbyCode = () => {
    if (!tournamentId) return;
    axios
      .patch(`tournaments/${tournamentId}`, { lobbyCode: lobbyCode || null })
      .then(() => toast.success("Lobby code saved."))
      .catch(() => toast.error("Failed to save lobby code."));
  };

  const handleConnectLobby = () => {
    setLobbyPasswordInput("");
    setLobbyPasswordModalOpen(true);
  };

  const handleConnectLobbyConfirm = async () => {
    if (!tournamentId) return;
    setLobbyPasswordModalOpen(false);
    try {
      await axios.post(`tournaments/${tournamentId}/lobby/connect`, { password: lobbyPasswordInput });
      setLobbyConnected(true);
      toast.success("Connected to lobby.");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to connect to lobby.";
      toast.error(msg);
    }
  };

  const handleDisconnectLobby = async () => {
    if (!tournamentId) return;
    await axios.delete(`tournaments/${tournamentId}/lobby/disconnect`).catch(() => {});
    setLobbyConnected(false);
    toast.success("Disconnected from lobby.");
  };

  return (
    <div className="flex flex-row gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-row items-center gap-4 mb-1">
          <button
            onClick={() => navigate("/manage")}
            className="text-rossoTesto hover:underline flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back</span>
          </button>
{canControl && tournamentId && (
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-rossoTesto text-sm whitespace-nowrap">Lobby code:</label>
              <input
                className="border border-gray-400 bg-white text-gray-800 px-2 py-0.5 rounded w-32 text-sm"
                type="text"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value)}
                placeholder="e.g. ABC123"
              />
              <button
                onClick={handleSaveLobbyCode}
                className="flex items-center gap-1 bg-rossoTesto text-white px-2 py-1 rounded hover:opacity-90 text-sm"
              >
                Save
              </button>
              <button
                onClick={lobbyConnected ? handleDisconnectLobby : handleConnectLobby}
                className="flex items-center gap-2 bg-rossoTesto text-white px-3 py-1 rounded hover:opacity-90 text-sm"
              >
                <FontAwesomeIcon icon={faBroadcastTower} />
                <span>{lobbyConnected ? "Disconnect from lobby" : "Connect to lobby"}</span>
              </button>
              <button
                onClick={() => setParticipantsOpen(true)}
                className="flex items-center gap-2 bg-rossoTesto text-white px-3 py-1 rounded hover:opacity-90 text-sm"
              >
                <FontAwesomeIcon icon={faUsers} />
                <span>Participants</span>
              </button>
            </div>
          )}
        </div>
        <TournamentSettings controls={canControl} tournamentId={Number(tournamentId)} matchUpdateSignal={matchUpdateSignal} />
      </div>

      {canControl && tournamentId && (
        <ManageParticipantsModal
          open={participantsOpen}
          onClose={() => setParticipantsOpen(false)}
          canEditHelpers={canEditHelpers}
          players={{
            tournamentPlayers,
            availableToAdd: availablePlayersToAdd,
            onAdd: handleAddPlayer,
            onRemove: handleRemovePlayer,
          }}
          helpers={{
            helpers: helpersState.helpers,
            availableCandidates,
            onAdd: (id) => helpersActions.addHelper(id),
            onRemove: (id) => helpersActions.removeHelper(id),
          }}
        />
      )}

      <LobbyPasswordModal
        open={lobbyPasswordModalOpen}
        password={lobbyPasswordInput}
        onPasswordChange={setLobbyPasswordInput}
        onConfirm={handleConnectLobbyConfirm}
        onCancel={() => setLobbyPasswordModalOpen(false)}
      />
    </div>
  );
}
