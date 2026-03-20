import TournamentSettings from "@/components/manage/tournament/TournamentSettings";
import LobbiesModal from "@/components/modals/LobbiesModal";
import { btnPrimary } from "@/styles/buttonStyles";
import { useParams } from "react-router-dom";
import { faBroadcastTower, faGear, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useCallback } from "react";
import { useMatchHub } from "@/services/useMatchHub";
import axios from "axios";
import { useAuthContext } from "@/services/auth/AuthContext";
import { useHelpers } from "@/services/helpers/useHelpers";
import { Player } from "@/models/Player";
import ManageParticipantsModal from "@/components/modals/ManageParticipantsModal";
import { toast } from "react-toastify";

export default function ManagePage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [lobbiesModalOpen, setLobbiesModalOpen] = useState(false);
  const { state: authState } = useAuthContext();
  const account = authState.account;

  const [isTournamentOwner, setIsTournamentOwner] = useState(false);
  const [isHelper, setIsHelper] = useState(false);

  const isAdmin = account?.isAdmin ?? false;
  const canEditHelpers = isAdmin || isTournamentOwner;
  const canControl = isAdmin || isTournamentOwner || isHelper;

  const { state: helpersState, actions: helpersActions } = useHelpers(Number(tournamentId));

  const [matchUpdateSignal, setMatchUpdateSignal] = useState(0);
  const onMatchUpdate = useCallback(() => { setMatchUpdateSignal(s => s + 1); }, []);
  useMatchHub(onMatchUpdate, Number(tournamentId) || undefined);

  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [tournamentPlayers, setTournamentPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);

  // Fetch tournament detail and owner check
  useEffect(() => {
    if (!tournamentId) return;
    axios
      .get<{ id: number; name: string; owner?: { id: string } }>(`tournaments/${tournamentId}`)
      .then((r) => {
        document.title = `${r.data.name} — Tournament Manager`;
        if (account && r.data.owner?.id === account.id) {
          setIsTournamentOwner(true);
        }
      })
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

  // Load helpers list and players
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

  return (
    <div>
      <TournamentSettings
        controls={canControl}
        tournamentId={Number(tournamentId)}
        matchUpdateSignal={matchUpdateSignal}
        headerActions={
          canControl && tournamentId ? (
            <>
              {/* Desktop: two separate buttons */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setLobbiesModalOpen(true)}
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

              {/* Mobile: single gear button with dropdown */}
              <div className="relative md:hidden">
                <button
                  onClick={() => setSettingsMenuOpen((v) => !v)}
                  className={`flex items-center justify-center w-9 h-9 ${btnPrimary}`}
                >
                  <FontAwesomeIcon icon={faGear} className="text-base" />
                </button>
                {settingsMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setSettingsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[150px]">
                      <button
                        onClick={() => { setSettingsMenuOpen(false); setLobbiesModalOpen(true); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FontAwesomeIcon icon={faBroadcastTower} className="text-rossoTesto" />
                        Lobbies
                      </button>
                      <button
                        onClick={() => { setSettingsMenuOpen(false); setParticipantsOpen(true); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FontAwesomeIcon icon={faUsers} className="text-rossoTesto" />
                        Participants
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : undefined
        }
      />

      {canControl && tournamentId && (
        <>
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

          <LobbiesModal
            open={lobbiesModalOpen}
            tournamentId={tournamentId}
            onClose={() => setLobbiesModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
