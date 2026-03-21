import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CreateMatchModal from "@/components/modals/CreateMatchModal";
import { Division } from "@/models/Division";
import MatchTable from "@/components/manage/tournament/MatchTable";
import { useMatches } from "@/services/matches/useMatches";

type MatchesViewProps = {
  division: Division;
  controls?: boolean;
  tournamentId?: number;
  matchUpdateSignal?: number;
};

export default function MatchesView({
  division,
  controls = false,
  tournamentId,
  matchUpdateSignal,
}: MatchesViewProps) {
  const { state, actions } = useMatches(division.id);
  const [createMatchModalOpened, setCreateMatchModalOpened] = useState(false);

  useEffect(() => {
    actions.list();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division.id]);

  return (
    <div className="mt-4">
      {controls && (
        <CreateMatchModal
          division={division}
          tournamentId={tournamentId}
          open={createMatchModalOpened}
          onClose={() => setCreateMatchModalOpened(false)}
          onCreate={actions.create}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        {controls && (
          <button
            onClick={() => setCreateMatchModalOpened(true)}
            className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 font-medium"
          >
            <FontAwesomeIcon icon={faPlus} />
            New match
          </button>
        )}
      </div>

      {state.matches.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">No matches yet.</p>
      ) : (
        <div className="flex flex-col gap-0">
          {state.matches.map((match) => (
            <MatchTable
              key={match.id}
              controls={controls}
              division={division}
              tournamentId={tournamentId}
              matchUpdateSignal={matchUpdateSignal}
              onDeleteStanding={(playerId, songId) =>
                actions.deleteStandingsForPlayerFromMatch(match.id, playerId, songId)
              }
              onMatchUpdated={actions.list}
              onEditMatchNotes={actions.editMatchNotes}
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
              onAddStandingToMatch={(playerId, songId, pct, sc, fail) =>
                actions.addStandingToMatch(match.id, playerId, songId, pct, sc, fail)
              }
              onEditStanding={(playerId, songId, pct, sc, fail) =>
                actions.editStandingFromMatch(match.id, songId, playerId, pct, sc, fail)
              }
              match={match}
            />
          ))}
        </div>
      )}
    </div>
  );
}
