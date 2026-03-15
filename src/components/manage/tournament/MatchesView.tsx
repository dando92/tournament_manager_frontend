import { useEffect, useState } from "react";
import axios from "axios";
import { Phase } from "../../../models/Phase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandFist } from "@fortawesome/free-solid-svg-icons";
import CreateMatchModal from "./modals/CreateMatchModal";
import { Division } from "../../../models/Division";
import MatchTable from "./MatchTable";
import { useMatches } from "../../../services/matches/useMatches";

type MatchesViewProps = {
  phaseId: number;
  controls?: boolean;
  division: Division;
  tournamentId?: number;
  matchUpdateSignal?: number;
};

export default function MatchesView({
  phaseId,
  division,
  controls = false,
  tournamentId,
  matchUpdateSignal,
}: MatchesViewProps) {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state, actions } = useMatches(phaseId);

  const [createMatchModalOpened, setCreateMatchModalOpened] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get<Phase>(`/phases/${phaseId}`)
      .then((response) => {
        setPhase(response.data);
        setError(null);
        actions.list();
      })
      .catch(() => setError("Failed to load phase."))
      .finally(() => setIsLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId]);

  if (isLoading) return <p className="text-gray-400 mt-10 text-center">Loading...</p>;
  if (error) return <p className="text-red-500 mt-10 text-center">{error}</p>;

  return (
    <div className="mt-10">
      {phase && controls && (
        <CreateMatchModal
          phase={phase}
          division={division}
          tournamentId={tournamentId}
          open={createMatchModalOpened}
          onClose={() => setCreateMatchModalOpened(false)}
          onCreate={actions.create}
        />
      )}
      <h1 className="text-center text-3xl text-rossoTesto">{phase?.name}</h1>
      {controls && (
        <div className="mt-2 w-full bg-gray-200 p-2 rounded-lg flex flex-row gap-4">
          <button
            onClick={() => setCreateMatchModalOpened(true)}
            className="text-green-800 font-bold flex flex-row gap-2 items-center"
          >
            <FontAwesomeIcon icon={faHandFist} />
            <span>New match</span>
          </button>
        </div>
      )}
      <div className="w-full mt-10">
        {state.matches.length === 0 && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-rossoTesto font-bold">
              No matches found.
            </p>
          </div>
        )}
        {phase &&
          state.matches.map((match) => (
            <MatchTable
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
    </div>
  );
}
