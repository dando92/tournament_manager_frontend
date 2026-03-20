import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { TournamentLobbyStateDto } from "@/services/useScoreHub";

type Props = {
  lobbyState: TournamentLobbyStateDto;
  singleColumn?: boolean;
};

export default function LiveScores({ lobbyState, singleColumn }: Props) {
  const [showJudgements] = useMemo(() => [true], []);

  const sortedPlayers = useMemo(() => {
    return [...lobbyState.players].sort((a, b) => {
      if (a.isFailed && !b.isFailed) return 1;
      if (!a.isFailed && b.isFailed) return -1;
      return (b.scorePercent ?? 0) - (a.scorePercent ?? 0);
    });
  }, [lobbyState]);

  const songTitle = lobbyState.songTitle || lobbyState.songPath.split("/")?.[1] || "";

  return (
    <div className="w-auto">
      <h2 className="text-rossoTesto">Now playing: {songTitle}</h2>
      <div className={`grid my-2 border-b pb-2 gap-1 ${singleColumn ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4"}`}>
        {sortedPlayers.map((player, idx) => (
          <div
            key={player.name}
            className={`flex flex-col items-start p-2 rounded-md shadow-md transition-transform transform ${
              player.isFailed === true ? "bg-red-300 opacity-50" : "bg-gray-700"
            } text-sfondoPagina ${idx === 0 ? "animate-first-place" : ""}`}
          >
            <div className="flex flex-row gap-5 justify-between items-end w-full">
              <span className="text-xl">
                <span className="italic">#{idx + 1}</span>{" "}
                <span className="font-bold">{player.name}</span>
              </span>
              <span className="font-bold text-xl">
                {player.scorePercent.toFixed(2)}%
              </span>
            </div>
            {showJudgements && player.judgments && (
              <div className="flex text-xs text-ellipsis flex-wrap gap-3 text-bianco">
                {player.judgments.fantasticPlus > 0 && (
                  <span className="text-blue-200">{player.judgments.fantasticPlus}FA+</span>
                )}
                {player.judgments.fantastics > 0 && (
                  <span>{player.judgments.fantastics}FA</span>
                )}
                {player.judgments.excellents > 0 && (
                  <span className="text-yellow-300">{player.judgments.excellents}EX</span>
                )}
                {player.judgments.greats > 0 && (
                  <span className="text-green-300">{player.judgments.greats}GR</span>
                )}
                {player.judgments.decents > 0 && (
                  <span className="text-pink-300">{player.judgments.decents}DE</span>
                )}
                {player.judgments.wayOffs > 0 && (
                  <span className="text-orange-300">{player.judgments.wayOffs}WO</span>
                )}
                {player.judgments.misses > 0 && (
                  <span className="text-red-300">{player.judgments.misses}MISS</span>
                )}
              </div>
            )}
            {player.health != null && (
              <div className="w-full flex flex-row items-center gap-3">
                <FontAwesomeIcon icon={faHeart} className="text-white" />
                <div className="relative w-full h-2 my-2 rounded-md bg-grigio overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all ${
                      player.health === 1
                        ? "bg-green-500"
                        : player.health < 0.2
                          ? "bg-red-500"
                          : "bg-blue-500"
                    }`}
                    // health is a 0–1 float; width must be dynamic — cannot use Tailwind static classes
                    style={{ width: `${player.health * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
