import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faPencil, faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { Match } from "@/models/Match";
import { Player } from "@/models/Player";

type ScoreEntry = { score: number; percentage: number; isFailed: boolean };

type Props = {
  match: Match;
  controls: boolean;
  scoreTable: Record<string, ScoreEntry>;
  sortedPlayers: Player[];
  onOpenEditSong: (songId: number) => void;
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
  onDisablePlayer: (playerId: number, songId: number) => void;
  onDeleteStanding: (playerId: number, songId: number) => void;
};

export default function StandingsTable({
  match,
  controls,
  scoreTable,
  sortedPlayers,
  onOpenEditSong,
  onOpenAddStanding,
  onOpenEditStanding,
  onDisablePlayer,
  onDeleteStanding,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table
        className="w-full text-sm border-collapse"
        // min-width cannot be expressed as a static Tailwind class since it depends on round count
        style={{ minWidth: match.rounds.length * 130 + 260 }}
      >
        <thead>
          <tr className="bg-rossoTesto text-white">
            <th className="px-3 py-2.5 text-left font-semibold w-[160px]">Player</th>
            {match.rounds.map((round) => {
              const roundHasStandings = round.standings.length > 0;
              return (
                <th key={round.song.id} className="px-3 py-2.5 text-center font-semibold min-w-[130px]">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="truncate max-w-[110px]" title={round.song.title}>
                      {round.song.title}
                    </span>
                    {controls && !roundHasStandings && (
                      <button
                        onClick={() => onOpenEditSong(round.song.id)}
                        title="Change song"
                        className="opacity-60 hover:opacity-100 shrink-0"
                      >
                        <FontAwesomeIcon icon={faRefresh} className="text-xs" />
                      </button>
                    )}
                  </div>
                </th>
              );
            })}
            <th className="px-3 py-2.5 text-center font-semibold w-[72px]">Pts</th>
          </tr>
        </thead>

        <tbody>
          {sortedPlayers.map((player, i) => {
            const totalPoints = match.rounds
              .map((r) => r.standings.find((s) => s.score.player.id === player.id))
              .reduce((acc, s) => acc + (s?.points ?? 0), 0);

            return (
              <tr key={player.id} className="border-t border-gray-100 odd:bg-white even:bg-gray-50">
                {/* Player */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300 w-5 shrink-0">#{i + 1}</span>
                    <span className="font-medium text-gray-800 truncate">{player.playerName}</span>
                  </div>
                </td>

                {/* Score cells */}
                {match.rounds.map((round) => {
                  const key = `${player.id}-${round.song.id}`;
                  const scoreData = scoreTable[key];
                  const playerDisabled = scoreData?.isFailed && scoreData?.percentage === -1;

                  if (playerDisabled) {
                    return (
                      <td key={round.song.id} className="px-3 py-2 bg-gray-100 text-center">
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
                      <td key={round.song.id} className="px-3 py-2 text-center">
                        {controls ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onOpenAddStanding(player.id, round.song.id, player.playerName, round.song.title)}
                              title="Add score"
                              className="text-green-700 hover:text-green-900"
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                            <button
                              onClick={() => onDisablePlayer(player.id, round.song.id)}
                              title="Disable player for this round"
                              className="text-red-400 hover:text-red-600"
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  }

                  return (
                    <td
                      key={round.song.id}
                      className={`px-3 py-2 text-center ${scoreData.isFailed ? "bg-red-50" : ""}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className={`font-bold text-sm ${scoreData.isFailed ? "text-red-600" : "text-gray-800"}`}>
                            {scoreData.percentage.toFixed(1)}%
                          </span>
                          {scoreData.isFailed && (
                            <span className="text-xs bg-red-100 text-red-600 px-1 rounded font-semibold">F</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{scoreData.score} pts</span>
                        {controls && (
                          <button
                            onClick={() => onOpenEditStanding(
                              player.id,
                              round.song.id,
                              player.playerName,
                              round.song.title,
                              scoreData.percentage,
                              scoreData.score,
                              scoreData.isFailed,
                            )}
                            title="Edit score"
                            className="text-xs text-blue-400 hover:text-blue-600 mt-0.5"
                          >
                            <FontAwesomeIcon icon={faPencil} />
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}

                {/* Total */}
                <td className="px-3 py-2 text-center border-l border-gray-100">
                  <span className="font-bold text-gray-700">{totalPoints}</span>
                </td>
              </tr>
            );
          })}

          {sortedPlayers.length === 0 && (
            <tr>
              <td
                colSpan={match.rounds.length + 2}
                className="px-3 py-6 text-center text-gray-400 text-sm"
              >
                No players assigned to this match.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
