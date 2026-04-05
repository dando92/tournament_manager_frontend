import axios from "axios";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMemo } from "react";
import { useTournamentPageContext } from "@/features/tournament/context/TournamentPageContext";
import { useTournamentUpdates } from "@/features/tournament/context/TournamentUpdatesContext";

export default function TournamentLobbiesPage() {
  const { tournamentId, controls } = useTournamentPageContext();
  const { activeLobbies, lobbyStates } = useTournamentUpdates();

  const lobbies = useMemo(() => {
    return Array.from(activeLobbies.values())
      .filter((lobby) => lobby.tournamentId === tournamentId)
      .sort((a, b) => a.lobbyName.localeCompare(b.lobbyName));
  }, [activeLobbies, tournamentId]);

  async function handleDisconnectLobby(lobbyId: string) {
    try {
      await axios.delete(`tournaments/${tournamentId}/lobbies/${lobbyId}/disconnect`);
      toast.success("Lobby disconnected.");
    } catch {
      toast.error("Failed to disconnect lobby.");
    }
  }

  if (!controls) {
    return <Navigate to={`/tournament/${tournamentId}/overview`} replace />;
  }

  return (
    <div className="flex flex-col gap-6">
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
            {lobbies.map((lobby) => {
              const lobbyState = lobbyStates.get(lobby.lobbyId);
              return (
                <article key={lobby.lobbyId} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{lobby.lobbyName}</h3>
                      <p className="text-xs uppercase tracking-wide text-gray-500">{lobby.lobbyCode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleDisconnectLobby(lobby.lobbyId).catch(() => {});
                      }}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-white p-3">
                      <div className="text-xs uppercase tracking-wide text-gray-400">Song</div>
                      <div className="mt-1 font-semibold text-gray-800">
                        {lobbyState?.songTitle || lobbyState?.songPath || "No song selected"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <div className="text-xs uppercase tracking-wide text-gray-400">Spectators</div>
                      <div className="mt-1 font-semibold text-gray-800">
                        {lobbyState?.spectators.length ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">Players</div>
                    {lobbyState?.players.length ? (
                      <div className="mt-2 flex flex-col gap-2">
                        {lobbyState.players.map((player) => (
                          <div
                            key={`${lobby.lobbyId}-${player.playerId}-${player.name}`}
                            className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                          >
                            <div>
                              <div className="font-semibold text-gray-900">{player.name}</div>
                              <div className="text-xs text-gray-500">{player.playerId}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-700">{player.screenName}</div>
                              <div className={`text-xs ${player.ready ? "text-emerald-600" : "text-gray-400"}`}>
                                {player.ready ? "Ready" : "Not ready"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">Waiting for lobby state...</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
