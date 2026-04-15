import { LiveMatchStateDto, LobbyStateDto } from "@/features/live/services/useScoreHub";
import LiveScoreCard from "@/features/live/components/LiveScoreCard";
import { useLiveScores } from "@/features/live/hooks/useLiveScores";

type Props = {
  lobbyState: LiveMatchStateDto;
  latestLobbyState?: LobbyStateDto;
  singleColumn?: boolean;
};

export default function LobbyLiveScores({ lobbyState, latestLobbyState, singleColumn }: Props) {
  const { showJudgements, sortedPlayers, songTitle } = useLiveScores(lobbyState, latestLobbyState);

  return (
    <div className="w-auto">
      <h2 className="text-primary-dark">Now playing: {songTitle}</h2>
      <div className={`grid my-2 border-b pb-2 gap-1 ${singleColumn ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4"}`}>
        {sortedPlayers.map((player, idx) => (
          <LiveScoreCard
            key={player.name}
            player={player}
            rank={idx + 1}
            showJudgements={showJudgements}
          />
        ))}
      </div>
    </div>
  );
}
