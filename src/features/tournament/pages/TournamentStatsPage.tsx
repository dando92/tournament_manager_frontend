import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useTournamentPageContext } from "@/features/tournament/context/TournamentPageContext";

type PlayerScoreRow = {
  id: string;
  playerId: number;
  playerName: string;
  divisionName: string;
  phaseName: string;
  matchName: string;
  songTitle: string;
  songArtist?: string;
  percentage: number;
  points: number;
  isFailed: boolean;
};

function scoreBadgeClass(percentage: number, isFailed: boolean): string {
  if (isFailed) return "bg-red-100 text-red-700 border-red-200";
  if (percentage >= 99) return "bg-purple-100 text-purple-800 border-purple-200";
  if (percentage >= 95) return "bg-blue-100 text-blue-800 border-blue-200";
  if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
  if (percentage >= 80) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

export default function TournamentStatsPage() {
  const { divisions } = useTournamentPageContext();
  const [search, setSearch] = useState("");
  const [expandedPlayers, setExpandedPlayers] = useState<Set<number>>(new Set());

  function toNumber(value: unknown): number {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const playerScores = useMemo<PlayerScoreRow[]>(() => {
    return divisions.flatMap((division) =>
      (division.phases ?? []).flatMap((phase) =>
        (phase.matches ?? []).flatMap((match) =>
          (match.rounds ?? []).flatMap((round) =>
            (round.standings ?? []).map((standing) => ({
              id: `${match.id}-${round.id}-${standing.id}`,
              playerId: standing.score.player.id,
              playerName: standing.score.player.playerName,
              divisionName: division.name,
              phaseName: phase.name,
              matchName: match.name,
              songTitle: round.song.title,
              songArtist: round.song.artist,
              percentage: toNumber(standing.score.percentage),
              points: toNumber(standing.points),
              isFailed: standing.score.isFailed,
            })),
          ),
        ),
      ),
    );
  }, [divisions]);

  const groupedPlayers = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();
    const map = new Map<number, { playerId: number; playerName: string; rows: PlayerScoreRow[] }>();

    for (const row of playerScores) {
      if (lowerSearch && !row.playerName.toLowerCase().includes(lowerSearch)) continue;
      const existing = map.get(row.playerId) ?? { playerId: row.playerId, playerName: row.playerName, rows: [] };
      existing.rows.push(row);
      map.set(row.playerId, existing);
    }

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        rows: entry.rows.sort((a, b) =>
          a.isFailed !== b.isFailed
            ? (a.isFailed ? 1 : -1)
            : b.percentage - a.percentage || b.points - a.points || a.songTitle.localeCompare(b.songTitle),
        ),
        averageScore:
          entry.rows.reduce((sum, row) => sum + row.percentage, 0) / Math.max(entry.rows.length, 1),
      }))
      .sort((a, b) => a.playerName.localeCompare(b.playerName));
  }, [playerScores, search]);

  function togglePlayer(playerId: number) {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      next.has(playerId) ? next.delete(playerId) : next.add(playerId);
      return next;
    });
  }

  if (playerScores.length === 0) {
    return <p className="text-sm text-gray-400 italic">No scores recorded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
      <div>
        <h2 className="text-primary-dark font-bold text-xl">Stats</h2>
        <p className="text-sm text-gray-500">
          {playerScores.length} recorded score{playerScores.length !== 1 ? "s" : ""} across {groupedPlayers.length} player{groupedPlayers.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
        />
        <input
          type="search"
          placeholder="Search player name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/30"
        />
      </div>

      {groupedPlayers.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No players match your search.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {groupedPlayers.map((player) => {
            const isOpen = expandedPlayers.has(player.playerId);
            return (
              <div key={player.playerId} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => togglePlayer(player.playerId)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={isOpen ? faChevronUp : faChevronDown}
                    className="text-gray-400 text-xs w-3 shrink-0"
                  />
                  <span className="flex-1 font-semibold text-gray-900 truncate">{player.playerName}</span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {player.rows.length} score{player.rows.length !== 1 ? "s" : ""}
                  </span>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded border ${scoreBadgeClass(player.averageScore, false)}`}>
                    Avg {player.averageScore.toFixed(2)}%
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-3">
                    <div className="flex flex-col gap-2">
                      {player.rows.map((row) => (
                        <div
                          key={row.id}
                          className="grid gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 md:grid-cols-[minmax(0,1.3fr)_auto] md:items-center"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {row.songArtist ? `${row.songArtist} - ${row.songTitle}` : row.songTitle}
                            </div>
                            <div className="text-xs text-gray-500">
                              {row.divisionName} / {row.phaseName} / {row.matchName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-start md:justify-end flex-wrap">
                            <span className="text-xs text-gray-500">{row.points} pts</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${scoreBadgeClass(row.percentage, row.isFailed)}`}>
                              {row.isFailed ? "FAILED" : `${row.percentage.toFixed(2)}%`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
