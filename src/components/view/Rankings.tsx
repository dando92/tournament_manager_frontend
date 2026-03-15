import { useEffect, useState } from "react";
import axios from "axios";
import { faMedal, faSpoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Player } from "@/models/Player.ts";
import { useMatchHub } from "@/services/useMatchHub.ts";

export default function Rankings() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    axios.get("players").then((response) => {
      setPlayers(response.data);
    });
  }, []);

  useMatchHub(() => {
    axios.get("players").then((response) => {
      setPlayers(response.data);
    });
  });


  return (
    <div>
      <div className={"flex flex-col gap-2"}>
        <h2 className={"text-rossoTesto text-2xl"}>Overall players ranking</h2>
        <PlayerRanking players={players} />
      </div>
    </div>
  );
}

function PlayerRanking({ players }: { players: Player[] }) {
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);

  const colors = [
    "#dcb700", // gold
    "#C0C0C0", // silver
    "#CD7F32", // bronze
    "#da8446", // wood
  ];

  const fontAwesomeIcons = [faMedal, faMedal, faMedal, faSpoon];

  useEffect(() => {
    setSortedPlayers([...players].sort((a, b) => b.score - a.score));
  }, [players]);

  return (
    <div className="rounded-lg shadow-md">
      {sortedPlayers.map((player, index) => (
        <div
          key={player.id}
          className={`flex items-center gap-4 p-4 mb-2 rounded-md ${
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          } border border-gray-200`}
          style={{
            borderLeft: `4px solid ${colors[index] || "#1F8DDE"}`,
          }}
        >
          {index <= 3 && (
            <span style={{ color: colors[index] }} className="text-xl">
              <FontAwesomeIcon icon={fontAwesomeIcons[index] || faSpoon} />
            </span>
          )}
          <span className="flex-1 text-lg font-semibold text-gray-800">
             #{index+1} {player.playerName}
          </span>
          <span
            className="text-gray-700 text-2xl font-bold"
            style={{
              color: colors[index],
            }}
          >
            {player.score}
          </span>
        </div>
      ))}
    </div>
  );
}
