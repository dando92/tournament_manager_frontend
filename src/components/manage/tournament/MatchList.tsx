import { useEffect, useState } from "react";
import axios from "axios";
import { Phase } from "@/models/Phase";
import { Division } from "@/models/Division";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CreateMatchModal from "@/components/modals/CreateMatchModal";
import MatchCard from "@/components/manage/tournament/MatchCard";
import { useMatches } from "@/services/matches/useMatches";

type MatchListProps = {
  phaseId: number;
  division: Division;
  controls?: boolean;
  tournamentId?: number;
  matchUpdateSignal?: number;
};

export default function MatchList({
  phaseId,
  division,
  controls = false,
  tournamentId,
  matchUpdateSignal,
}: MatchListProps) {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state, actions } = useMatches(phaseId);

  const [createMatchModalOpen, setCreateMatchModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get<Phase>(`/phases/${phaseId}`)
      .then((r) => {
        setPhase(r.data);
        setError(null);
        actions.list();
      })
      .catch(() => setError("Failed to load phase."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId]);

  if (isLoading) return <p className="text-gray-400 mt-6 text-center text-sm">Loading...</p>;
  if (error) return <p className="text-red-500 mt-6 text-center text-sm">{error}</p>;

  return (
    <div className="mt-4">
      {phase && controls && (
        <CreateMatchModal
          phase={phase}
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
          {phase &&
            state.matches.map((match) => (
              <MatchCard
                key={match.id}
                controls={controls}
                division={division}
                phase={phase}
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
