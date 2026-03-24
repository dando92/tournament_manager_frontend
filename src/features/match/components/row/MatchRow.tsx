import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPencil } from "@fortawesome/free-solid-svg-icons";
import { Match } from "@/features/match/types/Match";
import { Player } from "@/features/player/types/Player";

type ScoreEntry = { score: number; percentage: number; isFailed: boolean };

type MatchRowProps = {
  match: Match;
  player: Player;
  rank: number;
  controls: boolean;
  scoreTable: Record<string, ScoreEntry>;
  onOpenAddStanding: (playerId: number, songId: number, playerName: string, songTitle: string) => void;
  onOpenEditStanding: (
    playerId: number,
    songId: number,
    playerName: string,
    songTitle: string,
    percentage: number,
    score: number,
    isFailed: boolean,
  ) => void;
  onDeleteStanding: (playerId: number, songId: number) => void;
};

export default function MatchRow({
  match,
  player,
  rank,
  controls,
  scoreTable,
  onOpenAddStanding,
  onOpenEditStanding,
  onDeleteStanding,
}: MatchRowProps) {
  const totalPoints = match.rounds
    .map((r) => r.standings.find((s) => s.score.player.id === player.id))
    .reduce((acc, s) => acc + (s?.points ?? 0), 0);

  return (
    <tr className="border-t border-gray-100 odd:bg-white even:bg-gray-50">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-300 w-5 shrink-0">#{rank + 1}</span>
          <span className="font-medium text-gray-800 truncate">{player.playerName}</span>
        </div>
      </td>

      {match.rounds.map((round) => {
        const key = `${player.id}-${round.song.id}`;
        const scoreData = scoreTable[key];
        const playerDisabled = scoreData?.isFailed && scoreData?.percentage === -1;

        if (playerDisabled) {
          return (
            <td key={round.song.id} className="px-1 sm:px-3 py-2 bg-gray-100 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400 italic">disabled</span>
                {controls && (
                  <button
                    onClick={() => onDeleteStanding(player.id, round.song.id)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    reactivate
                  </button>
                )}
              </div>
            </td>
          );
        }

        if (!scoreData) {
          return (
            <td key={round.song.id} className="px-1 sm:px-3 py-2 text-center">
              {controls ? (
                <button
                  onClick={() => onOpenAddStanding(player.id, round.song.id, player.playerName, round.song.title)}
                  title="Add score"
                  className="text-green-700 hover:text-green-900"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </td>
          );
        }

        return (
          <td
            key={round.song.id}
            className={`px-1 sm:px-3 py-2 text-center ${scoreData.isFailed ? "bg-red-50" : ""}`}
          >
            <div className="inline-flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1">
                <span className={`font-bold text-base ${scoreData.isFailed ? "text-red-600" : "text-gray-800"}`}>
                  {scoreData.percentage.toFixed(2)}%
                </span>
                {scoreData.isFailed && (
                  <span className="text-xs bg-red-100 text-red-600 px-1 rounded font-semibold">F</span>
                )}
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs text-gray-400">{scoreData.score} pts</span>
                {controls && (
                  <button
                    onClick={() =>
                      onOpenEditStanding(
                        player.id,
                        round.song.id,
                        player.playerName,
                        round.song.title,
                        scoreData.percentage,
                        scoreData.score,
                        scoreData.isFailed,
                      )
                    }
                    title="Edit score"
                    className="text-xs text-blue-400 hover:text-blue-600 shrink-0"
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </button>
                )}
              </div>
            </div>
          </td>
        );
      })}

      <td className="px-1 sm:px-3 py-2 text-center border-l border-gray-100">
        <span className="font-bold text-gray-700">{totalPoints}</span>
      </td>
    </tr>
  );
}
