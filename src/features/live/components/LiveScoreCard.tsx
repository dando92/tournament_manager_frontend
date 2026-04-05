import { LiveMatchPlayerDto } from "@/features/live/services/useScoreHub";

type LiveScoreCardProps = {
  player: LiveMatchPlayerDto;
  rank: number;
  showJudgements: boolean;
};

export default function LiveScoreCard({
  player,
  rank,
  showJudgements,
}: LiveScoreCardProps) {
  return (
    <div
      className={`flex flex-col items-start p-2 rounded-md shadow-md transition-transform transform ${
        player.isFailed === true ? "bg-red-300 opacity-50" : "bg-gray-700"
      } text-white ${rank === 1 ? "animate-first-place" : ""}`}
    >
      <div className="flex flex-row gap-5 justify-between items-end w-full">
        <span className="text-xl">
          <span className="italic">#{rank}</span> <span className="font-bold">{player.name}</span>
        </span>
        <div className="flex items-baseline gap-2">
          {player.exScore != null && (
            <span className="font-bold text-xl text-cyan-400">{player.exScore.toFixed(2)}%</span>
          )}
          <span className={`font-bold ${player.exScore != null ? "text-sm text-white/70" : "text-xl"}`}>
            {player.scorePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      {showJudgements && player.judgments && (
        <div className="flex text-xs text-ellipsis flex-wrap gap-3 text-white">
          {player.judgments.fantasticPlus > 0 && (
            <span className="text-blue-200">{player.judgments.fantasticPlus}FA+</span>
          )}
          {player.judgments.fantastics > 0 && <span>{player.judgments.fantastics}FA</span>}
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
    </div>
  );
}
