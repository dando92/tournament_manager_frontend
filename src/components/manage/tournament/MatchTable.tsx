import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Match } from "../../../models/Match";
import {
  faBan,
  faInfoCircle,
  faPencil,
  faPlus,
  faRefresh,
  faStickyNote,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Division } from "../../../models/Division";
import { Phase } from "../../../models/Phase";
import AddEditSongToMatchModal from "./modals/AddEditSongToMatchModal";
import { useEffect, useRef, useState } from "react";
import StandingModal from "./modals/StandingModal";
import EditMatchNotesModal from "./modals/EditMatchNotesModal";
import { Tab } from "@headlessui/react";
import { classNames } from "../../../utils/classNames";

type MatchTableProps = {
  division: Division;
  phase: Phase;
  match: Match;
  controls?: boolean;
  tournamentId?: number;
  matchUpdateSignal?: number;
  onMatchUpdated: () => void;
  onDeleteMatch: (matchId: number) => void;
  onAddSongToMatchByRoll: (group: string, level: string) => void;
  onAddSongToMatchBySongId: (songId: number) => void;
  onEditSongToMatchByRoll: (group: string, level: string, editSongId: number) => void;
  onEditSongToMatchBySongId: (songId: number, editSongId: number) => void;
  onAddStandingToMatch: (
    playerId: number,
    songId: number,
    percentage: number,
    score: number,
    isFailed: boolean,
  ) => void;
  onEditMatchNotes: (matchId: number, notes: string) => void;
  onEditStanding: (
    playerId: number,
    songId: number,
    percentage: number,
    score: number,
    isFailed: boolean,
  ) => void;
  onDeleteStanding: (playerId: number, songId: number) => void;
};

type StandingModalState = {
  open: boolean;
  mode: "add" | "edit";
  playerId: number;
  songId: number;
  playerName: string;
  songTitle: string;
  initialPercentage?: number;
  initialScore?: number;
  initialIsFailed?: boolean;
};

const closedModal: StandingModalState = {
  open: false,
  mode: "add",
  playerId: 0,
  songId: 0,
  playerName: "",
  songTitle: "",
};

export default function MatchTable({
  division,
  phase,
  match,
  controls = false,
  tournamentId,
  matchUpdateSignal,
  onMatchUpdated,
  onDeleteMatch,
  onAddSongToMatchByRoll,
  onAddSongToMatchBySongId,
  onEditSongToMatchByRoll,
  onEditSongToMatchBySongId,
  onAddStandingToMatch,
  onEditMatchNotes,
  onDeleteStanding,
  onEditStanding,
}: MatchTableProps) {
  const scoreTable: {
    [key: string]: { score: number; percentage: number; isFailed: boolean };
  } = {};

  const [addSongToMatchModalOpen, setAddSongToMatchModalOpen] = useState(false);
  const [editSongId, setEditSongId] = useState<number | null>(null);
  const [standingModal, setStandingModal] = useState<StandingModalState>(closedModal);
  const [EditMatchNotesModalOpen, setEditMatchNotesModalOpen] = useState(false);

  const onMatchUpdatedRef = useRef(onMatchUpdated);
  useEffect(() => { onMatchUpdatedRef.current = onMatchUpdated; });

  match.rounds.forEach((round) => {
    round.standings.forEach((standing) => {
      const key = `${standing.score.player.id}-${standing.score.song.id}`;
      scoreTable[key] = {
        score: standing.points,
        percentage: standing.score.percentage,
        isFailed: standing.score.isFailed,
      };
    });
  });

  useEffect(() => {
    if (!matchUpdateSignal) return;
    onMatchUpdatedRef.current();
  }, [matchUpdateSignal]);

  const getTotalPoints = (playerId: number) => {
    return match.rounds
      .map((round) => round.standings.find((s) => s.score.player.id === playerId))
      .reduce((acc, standing) => {
        if (standing) return acc + standing.points;
        return acc;
      }, 0);
  };

  const sortedPlayers = [...match.players].sort(
    (a, b) => getTotalPoints(b.id) - getTotalPoints(a.id),
  );

  return (
    <div className="flex flex-col w-full p-4 my-3 rounded-lg">
      <div className="flex flex-row mb-6 justify-center items-center">
        <div>
          <h2 className="text-center text-4xl font-bold text-rossoTesto">
            <div className="flex flex-row justify-center items-center gap-3">
              <span className="text-xl">{match.name}</span>
              {controls && (
                <button
                  className="text-lg"
                  title={match.notes ? match.notes : "Add notes"}
                  onClick={() => setEditMatchNotesModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faStickyNote} />
                </button>
              )}
            </div>
          </h2>
          {match.subtitle && (
            <p className="text-sm font-normal text-rossoTesto flex flex-row items-center gap-1">
              <FontAwesomeIcon icon={faInfoCircle} />
              {match.subtitle}
            </p>
          )}
        </div>
        <AddEditSongToMatchModal
          songId={editSongId}
          phaseId={phase.id}
          matchId={match.id}
          divisionId={division.id}
          tournamentId={tournamentId}
          open={addSongToMatchModalOpen}
          onAddSongToMatchByRoll={(_, __, ___, group, level) => onAddSongToMatchByRoll(group, level)}
          onAddSongToMatchBySongId={(_, __, ___, songId) => onAddSongToMatchBySongId(songId)}
          onEditSongToMatchByRoll={(_, __, ___, group, level, editSongId) => onEditSongToMatchByRoll(group, level, editSongId)}
          onEditSongToMatchBySongId={(_, __, ___, songId, editSongId) => onEditSongToMatchBySongId(songId, editSongId)}
          onClose={() => {
            setAddSongToMatchModalOpen(false);
            setEditSongId(null);
          }}
        />
        <StandingModal
          {...standingModal}
          onClose={() => setStandingModal(closedModal)}
          onSave={(playerId, songId, pct, score, isFailed) => {
            if (standingModal.mode === "add") {
              onAddStandingToMatch(playerId, songId, pct, score, isFailed);
            } else {
              onEditStanding(playerId, songId, pct, score, isFailed);
            }
          }}
          onDelete={(playerId, songId) => onDeleteStanding(playerId, songId)}
        />
        <EditMatchNotesModal
          match={match}
          open={EditMatchNotesModalOpen}
          onClose={() => setEditMatchNotesModalOpen(false)}
          onSave={onEditMatchNotes}
        />
        {controls && (
          <div className="ml-3 bg-gray-300 rounded-xl p-3 flex flex-row gap-3">
            <button
              title="Add a new round/song to the match"
              onClick={() => setAddSongToMatchModalOpen(true)}
              className="text-green-800 font-bold flex flex-row gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button
              onClick={() => onDeleteMatch(match.id)}
              className="ml-3 text-red-800 font-bold flex flex-row gap-2"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Tab.Group>
          <Tab.List className="flex flex-row gap-10 border-b mt-5">
            <Tab
              className={({ selected }) =>
                classNames(
                  "py-2 px-4 text-lg",
                  selected
                    ? "border-b-2 border-blue-500 font-bold text-blue-500"
                    : "text-gray-500",
                )
              }
            >
              Match
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-3">
            <Tab.Panel>
              <div
                style={{ minWidth: match.rounds.length * 200 }}
                className="shadow-lg overflow-auto lg:min-w-fit"
              >
                <div
                  className={`grid w-full bg-rossoTesto rounded-t-lg`}
                  style={{ gridTemplateColumns: `repeat(${match.rounds.length + 2}, 1fr)` }}
                >
                  <div className="border-rossoTag p-2">
                    <div className="text-center font-bold text-rossoTag"></div>
                  </div>
                  {match.rounds.map((round, i) => {
                    const roundHasStandings = round.standings.length > 0;
                    return (
                      <div key={i} className="border-x border-rossoTag p-2">
                        <div className="text-center font-bold text-blue-100">
                          {round.song.title}
                          {controls && !roundHasStandings && (
                            <button
                              onClick={() => {
                                setEditSongId(round.song.id);
                                setAddSongToMatchModalOpen(true);
                              }}
                              className="ml-3"
                              title="Change round song"
                            >
                              <FontAwesomeIcon icon={faRefresh} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="p-2">
                    <div className="text-center font-bold text-blue-100">Total Points</div>
                  </div>
                </div>

                {sortedPlayers.map((player, i) => (
                  <div
                    key={i}
                    className="grid w-full odd:bg-white even:bg-gray-50"
                    style={{ gridTemplateColumns: `repeat(${match.rounds.length + 2}, 1fr)` }}
                  >
                    <div className="border border-gray-300 p-2">
                      <div className="text-center font-semibold text-gray-700">
                        {player.playerName}
                      </div>
                    </div>
                    {match.rounds.map((round, j) => {
                      const key = `${player.id}-${round.song.id}`;
                      const scoreData = scoreTable[key];
                      const playerDisabled = scoreData?.isFailed && scoreData?.percentage === -1;

                      if (playerDisabled) {
                        return (
                          <div
                            key={j}
                            className="flex flex-row gap-3 items-center justify-center bg-gray-400"
                          >
                            <p className="font-bold">Disabled</p>
                            {controls && (
                              <button
                                className="underline font-red-800 text-xs"
                                onClick={() => onDeleteStanding(player.id, round.song.id)}
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div key={j} className="border border-gray-300 p-2">
                          <div className="text-center justify-center flex flex-row gap-3 items-center text-gray-600">
                            <p
                              className={`${
                                scoreData?.isFailed ? "text-red-500 font-bold" : "text-black"
                              }`}
                            >
                              {scoreData && !playerDisabled
                                ? `${scoreData.score} (${scoreData.percentage}%) ${scoreData.isFailed ? "F" : ""}`
                                : "-"}
                            </p>
                            {controls && scoreData && (
                              <button
                                title="Edit standing"
                                className="text-xs text-blue-600"
                                onClick={() =>
                                  setStandingModal({
                                    open: true,
                                    mode: "edit",
                                    playerId: player.id,
                                    songId: round.song.id,
                                    playerName: player.playerName,
                                    songTitle: round.song.title,
                                    initialPercentage: scoreData.percentage,
                                    initialScore: scoreData.score,
                                    initialIsFailed: scoreData.isFailed,
                                  })
                                }
                              >
                                <FontAwesomeIcon icon={faPencil} />
                              </button>
                            )}
                            {!scoreData && controls && (
                              <>
                                <button
                                  title="Manually add score"
                                  className="text-green-700"
                                  onClick={() =>
                                    setStandingModal({
                                      open: true,
                                      mode: "add",
                                      playerId: player.id,
                                      songId: round.song.id,
                                      playerName: player.playerName,
                                      songTitle: round.song.title,
                                    })
                                  }
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </button>
                                <button
                                  title="Disable player for this round"
                                  className="text-xs ml-3 text-red-500"
                                  onClick={() => {
                                    onAddStandingToMatch(player.id, round.song.id, -1, 0, true);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faBan} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="border border-gray-300 p-2">
                      <div className="text-center text-gray-600">
                        {match.rounds
                          .map((round) =>
                            round.standings.find((s) => s.score.player.id === player.id),
                          )
                          .reduce((acc, standing) => {
                            if (standing) return acc + standing.points;
                            return acc;
                          }, 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
