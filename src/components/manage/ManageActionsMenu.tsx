import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBroadcastTower, faGear, faUsers } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary } from "@/styles/buttonStyles";
import { Player } from "@/models/Player";
import { useHelpers } from "@/services/helpers/useHelpers";
import LobbiesModal from "@/components/modals/LobbiesModal";
import ManageParticipantsModal from "@/components/modals/ManageParticipantsModal";

type Props = {
  tournamentId: string;
  canEditHelpers: boolean;
};

export default function ManageActionsMenu({ tournamentId, canEditHelpers }: Props) {
  const [lobbiesOpen, setLobbiesOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { state: helpersState, actions: helpersActions } = useHelpers(Number(tournamentId));
  const [tournamentPlayers, setTournamentPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  useEffect(() => {
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
  }, [tournamentId]);

  const availableCandidates = helpersState.candidates.filter(
    (c) => !helpersState.helpers.some((h) => h.id === c.id),
  );

  const availablePlayersToAdd = allPlayers.filter(
    (p) => !tournamentPlayers.some((tp) => tp.id === p.id),
  );

  const handleAddPlayer = (playerId: number) => {
    axios
      .post(`tournaments/${tournamentId}/players`, { playerId })
      .then(() => {
        const player = allPlayers.find((p) => p.id === playerId);
        if (player) {
          setTournamentPlayers((prev) =>
            [...prev, player].sort((a, b) => a.playerName.localeCompare(b.playerName)),
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

  return (
    <>
      {/* Desktop: two buttons */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => setLobbiesOpen(true)}
          className={`flex items-center gap-2 ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faBroadcastTower} className="text-sm" />
          <span className="text-sm">Lobbies</span>
        </button>
        <button
          onClick={() => setParticipantsOpen(true)}
          className={`flex items-center gap-2 ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faUsers} className="text-sm" />
          <span className="text-sm">Participants</span>
        </button>
      </div>

      {/* Mobile: gear button with dropdown */}
      <div className="relative md:hidden">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex items-center justify-center w-9 h-9 ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faGear} className="text-base" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[150px]">
              <button
                onClick={() => { setMenuOpen(false); setLobbiesOpen(true); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faBroadcastTower} className="text-primary-dark" />
                Lobbies
              </button>
              <button
                onClick={() => { setMenuOpen(false); setParticipantsOpen(true); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faUsers} className="text-primary-dark" />
                Participants
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <LobbiesModal
        open={lobbiesOpen}
        tournamentId={tournamentId}
        onClose={() => setLobbiesOpen(false)}
      />
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
    </>
  );
}
