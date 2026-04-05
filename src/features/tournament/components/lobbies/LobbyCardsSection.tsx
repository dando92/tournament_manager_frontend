import { LobbyStateDto } from "@/features/live/services/useScoreHub";
import LobbyCard from "./LobbyCard";

type LobbyEntry = {
  lobby: {
    lobbyId: string;
    lobbyName: string;
    lobbyCode: string;
  };
  lobbyState?: LobbyStateDto;
};

type Props = {
  lobbies: LobbyEntry[];
  onDisconnect: (lobbyId: string) => Promise<void>;
};

export default function LobbyCardsSection({ lobbies, onDisconnect }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Connected lobbies</h2>
          <p className="mt-1 text-sm text-gray-500">
            Each card reflects the current lobby state stream from SyncStart.
          </p>
        </div>
      </div>

      {lobbies.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">No connected lobbies.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {lobbies.map(({ lobby, lobbyState }) => (
            <LobbyCard
              key={lobby.lobbyId}
              lobbyId={lobby.lobbyId}
              lobbyName={lobby.lobbyName}
              lobbyCode={lobby.lobbyCode}
              lobbyState={lobbyState}
              onDisconnect={onDisconnect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
