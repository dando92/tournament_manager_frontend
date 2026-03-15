import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faPencil, faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { Match } from "../../../models/Match";
import { Player } from "../../../models/Player";

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
    // minWidth is dynamic (rounds * 200px) — cannot be expressed with Tailwind static classes
    <div
      style={{ minWidth: match.rounds.length * 200 }}
      className="shadow-lg overflow-auto lg:min-w-fit"
    >
      {/* gridTemplateColumns is dynamic (rounds + 2 columns) — cannot use Tailwind for this */}
      <div
        className="grid w-full bg-rossoTesto rounded-t-lg"
        style={{ gridTemplateColumns: `repeat(${match.rounds.length + 2}, 1fr)` }}
      >
        <div className="border-rossoTag p-2">
          <div className="text-center font-bold text-rossoTag"></div>
        </div>
        {match.rounds.map((round, i) => {
          const roundHasStandings = round.standings.length > 0;
          return (
            <div key={i} className="border-x border-rossoTag p-2">
              <div className="text-center font-bold text-blue-100">
                {round.song.title}
                {controls && !roundHasStandings && (
                  <button
                    onClick={() => onOpenEditSong(round.song.id)}
                    className="ml-3"
                    title="Change round song"
                  >
                    <FontAwesomeIcon icon={faRefresh} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div className="p-2">
          <div className="text-center font-bold text-blue-100">Total Points</div>
        </div>
      </div>

      {sortedPlayers.map((player, i) => (
        <div
          key={i}
          className="grid w-full odd:bg-white even:bg-gray-50"
          // gridTemplateColumns is dynamic — cannot use Tailwind for this
          style={{ gridTemplateColumns: `repeat(${match.rounds.length + 2}, 1fr)` }}
        >
          <div className="border border-gray-300 p-2">
            <div className="text-center font-semibold text-gray-700">{player.playerName}</div>
          </div>
          {match.rounds.map((round, j) => {
            const key = `${player.id}-${round.song.id}`;
            const scoreData = scoreTable[key];
            const playerDisabled = scoreData?.isFailed && scoreData?.percentage === -1;

            if (playerDisabled) {
              return (
                <div
                  key={j}
                  className="flex flex-row gap-3 items-center justify-center bg-gray-400"
                >
                  <p className="font-bold">Disabled</p>
                  {controls && (
                    <button
                      className="underline font-red-800 text-xs"
                      onClick={() => onDeleteStanding(player.id, round.song.id)}
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div key={j} className="border border-gray-300 p-2">
                <div className="text-center justify-center flex flex-row gap-3 items-center text-gray-600">
                  <p
                    className={`${
                      scoreData?.isFailed ? "text-red-500 font-bold" : "text-black"
                    }`}
                  >
                    {scoreData && !playerDisabled
                      ? `${scoreData.score} (${scoreData.percentage}%) ${scoreData.isFailed ? "F" : ""}`
                      : "-"}
                  </p>
                  {controls && scoreData && (
                    <button
                      title="Edit standing"
                      className="text-xs text-blue-600"
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
                    >
                      <FontAwesomeIcon icon={faPencil} />
                    </button>
                  )}
                  {!scoreData && controls && (
                    <>
                      <button
                        title="Manually add score"
                        className="text-green-700"
                        onClick={() =>
                          onOpenAddStanding(
                            player.id,
                            round.song.id,
                            player.playerName,
                            round.song.title,
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                      <button
                        title="Disable player for this round"
                        className="text-xs ml-3 text-red-500"
                        onClick={() => onDisablePlayer(player.id, round.song.id)}
                      >
                        <FontAwesomeIcon icon={faBan} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div className="border border-gray-300 p-2">
            <div className="text-center text-gray-600">
              {match.rounds
                .map((round) => round.standings.find((s) => s.score.player.id === player.id))
                .reduce((acc, standing) => {
                  if (standing) return acc + standing.points;
                  return acc;
                }, 0)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
