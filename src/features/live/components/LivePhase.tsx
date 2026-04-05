import LobbyLiveBlock from "@/features/live/components/LobbyLiveBlock";
import { useTournamentUpdates } from "@/features/tournament/context/TournamentUpdatesContext";

type Props = {
  tournamentId: number;
};

export default function LivePhase({ tournamentId }: Props) {
  const { activeLobbies, liveMatchStates } = useTournamentUpdates();

  const tournamentActiveLobbies = Array.from(activeLobbies.values()).filter(
    (lobby) => lobby.tournamentId === tournamentId,
  );
  const tournamentLiveStates = Array.from(liveMatchStates.values()).filter(
    (state) => state.tournamentId === tournamentId,
  );

  if (tournamentActiveLobbies.length === 0) {
    return <p className="text-gray-500">No active lobbies.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
      {tournamentLiveStates.map((state) => (
        <LobbyLiveBlock key={state.lobbyId} lobbyState={state} />
      ))}
      {tournamentActiveLobbies
        .filter((lobby) => !liveMatchStates.has(lobby.lobbyId))
        .map((lobby) => (
          <div key={lobby.lobbyId} className="p-4 rounded-md bg-gray-700 text-gray-400">
            <span className="font-semibold">{lobby.lobbyName}</span>
            <span className="ml-2 text-sm">Waiting for gameplay...</span>
          </div>
        ))}
    </div>
  );
}
