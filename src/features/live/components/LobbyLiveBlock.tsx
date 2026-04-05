import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv } from "@fortawesome/free-solid-svg-icons";
import LiveScores from "@/features/live/components/LiveScores";
import { LiveMatchStateDto } from "@/features/live/services/useScoreHub";
import { btnPrimary } from "@/styles/buttonStyles";

type Props = {
  lobbyState: LiveMatchStateDto;
};

export default function LobbyLiveBlock({ lobbyState }: Props) {
  const obsUrl = `${window.location.origin}/obs/${lobbyState.lobbyId}`;

  return (
    <div className="mb-6">
      <div className="flex items-stretch justify-between mb-2">
        <div className="flex flex-col justify-center">
          <span className="text-lg font-bold text-primary-dark">{lobbyState.lobbyName}</span>
          {lobbyState.lobbyCode && (
            <span className="text-xs text-gray-400">{lobbyState.lobbyCode}</span>
          )}
        </div>
        <a
          href={obsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 text-sm ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faTv} />
          <span>OBS source</span>
        </a>
      </div>
      <LiveScores lobbyState={lobbyState} singleColumn />
    </div>
  );
}
