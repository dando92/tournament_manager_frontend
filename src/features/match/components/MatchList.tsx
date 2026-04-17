import { useEffect, useState } from "react";
import { Division } from "@/features/division/types/Division";
import MatchCard from "@/features/match/components/MatchCard";
import { useMatches } from "@/features/match/services/useMatches";
import { Match } from "@/features/match/types/Match";
import { useTournamentUpdates } from "@/features/tournament/context/TournamentUpdatesContext";

type MatchListProps = {
  division: Division;
  controls?: boolean;
  tournamentId?: number;
  matchUpdateSignal?: number;
  phaseId?: number;
  phaseGroupId?: number;
  matchesOverride?: Match[];
};

export default function MatchList({
  division,
  controls = false,
  tournamentId,
  matchUpdateSignal,
  phaseId,
  phaseGroupId,
  matchesOverride,
}: MatchListProps) {
  const { state, actions } = useMatches(division.id);
  const { matchListVersions } = useTournamentUpdates();
  const [highlightedMatchId, setHighlightedMatchId] = useState<number | null>(null);
  const matchListVersion = matchListVersions.get(division.id) ?? 0;

  const sourceMatches = matchesOverride ?? state.matches;
  const visibleMatches = sourceMatches.filter((match) => {
    if (phaseGroupId !== undefined && match.phaseGroupId !== phaseGroupId) return false;
    if (phaseId !== undefined && match.phaseId !== phaseId) return false;
    return true;
  });

  useEffect(() => {
    actions.list();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division.id, matchUpdateSignal]);

  useEffect(() => {
    if (matchListVersion === 0) return;
    actions.list();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchListVersion]);

  return (
    <div className="mt-4">
      {visibleMatches.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">No matches yet.</p>
      ) : (
        <div>
          {[...visibleMatches].sort((a, b) => a.id - b.id).map((match) => (
            <MatchCard
              key={match.id}
              controls={controls}
              division={division}
              allMatches={visibleMatches}
              tournamentId={tournamentId}
              matchUpdateSignal={matchUpdateSignal}
              highlightedMatchId={highlightedMatchId}
              onHighlightMatch={setHighlightedMatchId}
              onDeleteStanding={(playerId, songId) =>
                actions.deleteStandingsForPlayerFromMatch(match.id, playerId, songId)
              }
              onMatchUpdated={actions.list}
              onEditMatchNotes={actions.editMatchNotes}
              onRenameMatch={actions.renameMatch}
              onDeleteMatch={actions.deleteMatch}
              onAddSongToMatchByRoll={(group, level) =>
                actions.addSongToMatchByRoll(match.id, division.id, group, level)
              }
              onAddSongToMatchBySongId={(songId) =>
                actions.addSongToMatchBySongId(match.id, songId)
              }
              onEditSongToMatchByRoll={(group, level, editSongId) =>
                actions.editSongToMatchByRoll(match.id, editSongId, division.id, group, level)
              }
              onEditSongToMatchBySongId={(songId, editSongId) =>
                actions.editSongToMatchBySongId(match.id, editSongId, songId)
              }
              onDeleteSongFromMatch={(songId) =>
                actions.deleteSongFromMatch(match.id, songId)
              }
              onAddStandingToMatch={(playerId, songId, pct, sc, fail) =>
                actions.addStandingToMatch(match.id, playerId, songId, pct, sc, fail)
              }
              onEditStanding={(playerId, songId, pct, sc, fail) =>
                actions.editStandingFromMatch(match.id, songId, playerId, pct, sc, fail)
              }
              onUpdateMatchPaths={actions.updateMatchPaths}
              onRefreshSelf={() => actions.refreshMatch(match.id)}
              match={match}
            />
          ))}
        </div>
      )}
    </div>
  );
}
