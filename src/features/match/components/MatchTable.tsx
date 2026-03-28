import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh, faTrash } from "@fortawesome/free-solid-svg-icons";
import { btnTrash } from "@/styles/buttonStyles";
import { Match } from "@/features/match/types/Match";
import MatchRow from "@/features/match/components/row/MatchRow";
import PathRow from "@/features/match/components/row/PathRow";
import EditPathRow from "@/features/match/components/row/EditPathRow";
import { toOrdinal } from "@/shared/utils";

type ScoreEntry = { score: number; percentage: number; isFailed: boolean };

type MatchTableProps = {
  match: Match;
  allMatches: Match[];
  maxPlayersPerMatch: number;
  controls: boolean;
  editMode: boolean;
  highlightedMatchId: number | null;
  onHighlightMatch: (id: number | null) => void;
  pendingTargetPaths: (number | null)[];
  onPendingTargetPathChange: (index: number, value: number | null) => void;
  onOpenEditSong: (songId: number) => void;
  onDeleteSong: (songId: number) => void;
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

export default function MatchTable({
  match,
  allMatches,
  maxPlayersPerMatch,
  controls,
  editMode,
  highlightedMatchId,
  onHighlightMatch,
  pendingTargetPaths,
  onPendingTargetPathChange,
  onOpenEditSong,
  onDeleteSong,
  onOpenAddStanding,
  onOpenEditStanding,
  onDeleteStanding,
}: MatchTableProps) {
  const [tooltip, setTooltip] = useState<{ roundId: number; title: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!tooltip) return;
    const close = () => setTooltip(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("click", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("click", close);
    };
  }, [tooltip]);

  const scoreTable: Record<string, ScoreEntry> = {};
  match.rounds.forEach((round) => {
    round.standings.forEach((standing) => {
      const key = `${standing.score.player.id}-${standing.score.song.id}`;
      scoreTable[key] = {
        score: standing.points,
        percentage: Number(standing.score.percentage),
        isFailed: standing.score.isFailed,
      };
    });
  });

  const getTotalPoints = (playerId: number) =>
    match.rounds
      .map((round) => round.standings.find((s) => s.score.player.id === playerId))
      .reduce((acc, standing) => acc + (standing?.points ?? 0), 0);

  const sortedPlayers = [...match.players].sort(
    (a, b) => getTotalPoints(b.id) - getTotalPoints(a.id),
  );

  const sourcePaths = match.sourcePaths ?? [];
  const hasContent = sortedPlayers.length > 0 || sourcePaths.length > 0;

  // colSpan for single-cell rows (PathRow, EditPathRow, empty message)
  const totalCols = editMode ? 1 : Math.max(2, match.rounds.length + 2);

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm border-collapse">
          {!editMode && match.rounds.length > 0 && (
            <thead>
              <tr className="bg-primary-dark text-white">
                <th className="px-3 py-2.5 text-left font-semibold w-[120px] sm:w-[160px]">Player</th>
                {match.rounds.map((round, idx) => {
                  const roundHasStandings = round.standings.length > 0;
                  return (
                    <th key={round.song.id} className="px-1 sm:px-3 py-2.5 text-center font-semibold min-w-[70px] sm:min-w-[130px]">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="sm:hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (tooltip?.roundId === round.song.id) {
                                setTooltip(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltip({ roundId: round.song.id, title: round.song.title, x: rect.left + rect.width / 2, y: rect.top - 8 });
                              }
                            }}
                            className="font-semibold px-1"
                          >
                            {idx + 1}
                          </button>
                        </div>
                        <span className="hidden sm:inline truncate max-w-[110px]" title={round.song.title}>
                          {round.song.title}
                        </span>
                        {controls && !roundHasStandings && (
                          <>
                            <button
                              onClick={() => onOpenEditSong(round.song.id)}
                              title="Change song"
                              className="opacity-60 hover:opacity-100 shrink-0"
                            >
                              <FontAwesomeIcon icon={faRefresh} className="text-xs" />
                            </button>
                            <button
                              onClick={() => onDeleteSong(round.song.id)}
                              title="Remove song"
                              className={`shrink-0 ${btnTrash}`}
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            </button>
                          </>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="px-1 sm:px-3 py-2.5 text-center font-semibold w-[48px] sm:w-[72px]">Pts</th>
              </tr>
            </thead>
          )}

          <tbody>
            {!hasContent && !editMode && (
              <tr>
                <td colSpan={totalCols} className="px-3 py-6 text-center text-gray-400 text-sm">
                  No match data available
                </td>
              </tr>
            )}

            {!editMode && sourcePaths.flatMap((sourceId) => {
              const sourceMatch = allMatches.find((m) => m.id === sourceId);
              const name = sourceMatch?.name ?? String(sourceId);
              const isSelected = highlightedMatchId === sourceId;
              // Find ALL rank positions in sourceMatch.targetPaths that point to this match
              const positions = (sourceMatch?.targetPaths ?? [])
                .map((id, idx) => ({ id, idx }))
                .filter(({ id }) => id === match.id)
                .map(({ idx }) => idx + 1);

              // Fallback: if no positions found, still show one row
              const rows = positions.length > 0 ? positions : [1];

              // Compute sorted players of source match only if it has standings
              const sourceHasResults = sourceMatch?.rounds.some((r) => r.standings.length > 0) ?? false;
              const sourceSortedPlayers = sourceHasResults
                ? [...(sourceMatch!.players)].sort((a, b) => {
                    const pts = (playerId: number) =>
                      sourceMatch!.rounds.reduce((acc, round) => {
                        const s = round.standings.find((s) => s.score.player.id === playerId);
                        return acc + (s?.points ?? 0);
                      }, 0);
                    return pts(b.id) - pts(a.id);
                  })
                : [];

              return rows
                .filter((pos) => {
                  if (!sourceHasResults) return true;
                  const advancedPlayer = sourceSortedPlayers[pos - 1];
                  return !advancedPlayer || !match.players.some((p) => p.id === advancedPlayer.id);
                })
                .map((pos) => (
                  <PathRow
                    key={`${sourceId}-${pos}`}
                    ordinalLabel={toOrdinal(pos)}
                    sourceMatchName={name}
                    colSpan={totalCols}
                    isSelected={isSelected}
                    onToggle={() => onHighlightMatch(isSelected ? null : sourceId)}
                  />
                ));
            })}

            {!editMode && sortedPlayers.map((player, i) => (
              <MatchRow
                key={player.id}
                match={match}
                player={player}
                rank={i}
                controls={controls}
                scoreTable={scoreTable}
                onOpenAddStanding={onOpenAddStanding}
                onOpenEditStanding={onOpenEditStanding}
                onDeleteStanding={onDeleteStanding}
              />
            ))}

            {editMode && Array.from({ length: maxPlayersPerMatch }).map((_, i) => (
              <EditPathRow
                key={i}
                index={i}
                allMatches={allMatches}
                currentMatchId={match.id}
                value={pendingTargetPaths[i] ?? null}
                onChange={(value) => onPendingTargetPathChange(i, value)}
                onHighlightMatch={onHighlightMatch}
              />
            ))}
          </tbody>
        </table>
      </div>

      {tooltip && createPortal(
        <div
          style={{ position: "fixed", left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)", zIndex: 9999 }}
          className="bg-gray-800 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap shadow-lg pointer-events-none"
        >
          {tooltip.title}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>,
        document.body,
      )}
    </>
  );
}
