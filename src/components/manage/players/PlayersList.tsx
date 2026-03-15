import { useEffect, useState } from "react";
import { Player } from "../../../models/Player";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

type PlayersListProps = {
  tournamentId: number;
};

export default function PlayersList({ tournamentId }: PlayersListProps) {
  const [tournamentPlayers, setTournamentPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(-1);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    axios.get<Player[]>(`tournaments/${tournamentId}/players`).then((r) => {
      setTournamentPlayers(r.data.sort((a, b) => a.playerName.localeCompare(b.playerName)));
    });
    axios.get<Player[]>("players").then((r) => {
      setAllPlayers(r.data.sort((a, b) => a.playerName.localeCompare(b.playerName)));
    });
  }, [tournamentId]);

  const getSelectedPlayer = () => {
    return tournamentPlayers.find((p) => p.id === selectedPlayerId);
  };

  const addPlayer = (playerId: number) => {
    axios.post(`tournaments/${tournamentId}/players`, { playerId }).then(() => {
      const player = allPlayers.find((p) => p.id === playerId);
      if (player) {
        setTournamentPlayers((prev) =>
          [...prev, player].sort((a, b) => a.playerName.localeCompare(b.playerName))
        );
      }
      toast.success("Player added to tournament.");
    }).catch(() => toast.error("Failed to add player."));
  };

  const removePlayer = (playerId: number) => {
    if (!window.confirm("Remove this player from the tournament?")) return;
    axios.delete(`tournaments/${tournamentId}/players/${playerId}`).then(() => {
      setTournamentPlayers((prev) => prev.filter((p) => p.id !== playerId));
      if (selectedPlayerId === playerId) setSelectedPlayerId(-1);
      toast.success("Player removed from tournament.");
    }).catch(() => toast.error("Failed to remove player."));
  };

  const filteredPlayers = tournamentPlayers.filter((p) =>
    search.length === 0 ? true : p.playerName.toLowerCase().includes(search.toLowerCase())
  );

  const availableToAdd = allPlayers.filter(
    (p) => !tournamentPlayers.some((tp) => tp.id === p.id)
  );

  return (
    <div>
      <div className="flex flex-col justify-start gap-3">
        <h2 className="text-red-700">Tournament Players</h2>

        {availableToAdd.length > 0 && (
          <div className="flex flex-row gap-2 items-center">
            <select
              className="border rounded px-2 py-1 text-sm"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  addPlayer(Number(e.target.value));
                  e.target.value = "";
                }
              }}
            >
              <option value="" disabled>Add player to tournament...</option>
              {availableToAdd.map((p) => (
                <option key={p.id} value={p.id}>{p.playerName}</option>
              ))}
            </select>
            <FontAwesomeIcon icon={faPlus} className="text-green-700" />
          </div>
        )}

        <div className="flex flex-row gap-5">
          <div className="bg-gray-100 w-[200px] h-[400px] overflow-auto">
            <input
              className="p-1 w-full border-blue-300 border outline-none"
              type="search"
              placeholder="Search player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                role="button"
                onClick={() => setSelectedPlayerId(player.id)}
                className={`${
                  selectedPlayerId === player.id
                    ? "bg-rossoTag text-white"
                    : "hover:bg-red-700 hover:text-white"
                } cursor-pointer py-2 px-3 flex justify-between items-center gap-3`}
              >
                <span>{player.playerName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePlayer(player.id);
                  }}
                  className="text-sm"
                  title="Remove from tournament"
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              </div>
            ))}
            {search.length > 0 && filteredPlayers.length === 0 && (
              <div className="text-center py-2 text-red-500">No player found</div>
            )}
            {tournamentPlayers.length === 0 && search.length === 0 && (
              <div className="text-center py-2 text-gray-400 text-sm">No players assigned yet.</div>
            )}
          </div>
          <div>
            {selectedPlayerId < 0 && (
              <div className="text-rossoTesto">Select a player from the list to view information.</div>
            )}
            {selectedPlayerId >= 0 && (
              <PlayerItem player={getSelectedPlayer() as Player} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerItem({ player }: { player: Player }) {
  return (
    <div className="flex flex-col gap-2 text-red-400">
      <h3 className="text-2xl text-red-700">Player Information</h3>
      <div>
        <span>Name: </span>
        <span>{player.playerName}</span>
      </div>
      <h3 className="mt-3 text-red-700">Player Scores</h3>
      <p>No scores on record for this player.</p>
    </div>
  );
}
