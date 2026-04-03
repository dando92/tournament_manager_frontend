import { useEffect, useState } from "react";
import { Division } from "@/features/division/types/Division";
import MatchCard from "@/features/match/components/MatchCard";
import { useMatches } from "@/features/match/services/useMatches";

type MatchListProps = {
  division: Division;
  controls?: boolean;
  tournamentId?: number;
  matchUpdateSignal?: number;
  phaseId?: number;
};

export default function MatchList({
  division,
  controls = false,
  tournamentId,
  matchUpdateSignal,
}: MatchListProps) {
  const { state, actions } = useMatches(division.id);
  const [highlightedMatchId, setHighlightedMatchId] = useState<number | null>(null);

  useEffect(() => {
    actions.list();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division.id, matchUpdateSignal]);

  return (
    <div className="mt-4">
      {state.matches.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">No matches yet.</p>
      ) : (
        <div>
          {[...state.matches].sort((a, b) => a.id - b.id).map((match) => (
            <MatchCard
              key={match.id}
              controls={controls}
              division={division}
              allMatches={state.matches}
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
