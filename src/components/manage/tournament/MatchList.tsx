import { useEffect, useState } from "react";
import { Division } from "@/models/Division";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CreateMatchModal from "@/components/modals/CreateMatchModal";
import MatchCard from "@/components/manage/tournament/MatchCard";
import { useMatches } from "@/services/matches/useMatches";

type MatchListProps = {
  division: Division;
  controls?: boolean;
  tournamentId?: number;
  matchUpdateSignal?: number;
};

export default function MatchList({
  division,
  controls = false,
  tournamentId,
  matchUpdateSignal,
}: MatchListProps) {
  const { state, actions } = useMatches(division.id);
  const [createMatchModalOpen, setCreateMatchModalOpen] = useState(false);

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
          open={createMatchModalOpen}
          onClose={() => setCreateMatchModalOpen(false)}
          onCreate={actions.create}
        />
      )}

      {controls && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setCreateMatchModalOpen(true)}
            className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 font-medium"
          >
            <FontAwesomeIcon icon={faPlus} />
            New match
          </button>
        </div>
      )}

      {state.matches.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">No matches yet.</p>
      ) : (
        <div>
          {state.matches.map((match) => (
            <MatchCard
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
