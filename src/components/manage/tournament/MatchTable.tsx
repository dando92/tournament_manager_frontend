import { Match } from "@/models/Match";
import { Division } from "@/models/Division";
import AddEditSongToMatchModal from "@/components/modals/AddEditSongToMatchModal";
import { useEffect, useRef, useState } from "react";
import StandingModal from "@/components/modals/StandingModal";
import EditMatchNotesModal from "@/components/modals/EditMatchNotesModal";
import MatchHeader from "@/components/manage/tournament/MatchHeader";
import StandingsTable from "@/components/manage/tournament/StandingsTable";

type MatchTableProps = {
  division: Division;
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
  const [editMatchNotesModalOpen, setEditMatchNotesModalOpen] = useState(false);

  const onMatchUpdatedRef = useRef(onMatchUpdated);
  useEffect(() => { onMatchUpdatedRef.current = onMatchUpdated; });

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

  useEffect(() => {
    if (!matchUpdateSignal) return;
    onMatchUpdatedRef.current();
  }, [matchUpdateSignal]);

  const getTotalPoints = (playerId: number) =>
    match.rounds
      .map((round) => round.standings.find((s) => s.score.player.id === playerId))
      .reduce((acc, standing) => acc + (standing?.points ?? 0), 0);

  const sortedPlayers = [...match.players].sort(
    (a, b) => getTotalPoints(b.id) - getTotalPoints(a.id),
  );

  return (
    <div className="flex flex-col w-full p-4 my-3 border border-gray-100 rounded-xl bg-white shadow-sm">
      <AddEditSongToMatchModal
        songId={editSongId}
        matchId={match.id}
        divisionId={division.id}
        tournamentId={tournamentId}
        open={addSongToMatchModalOpen}
        onAddSongToMatchByRoll={(_, __, group, level) => onAddSongToMatchByRoll(group, level)}
        onAddSongToMatchBySongId={(_, __, songId) => onAddSongToMatchBySongId(songId)}
        onEditSongToMatchByRoll={(_, __, group, level, editSongId) => onEditSongToMatchByRoll(group, level, editSongId)}
        onEditSongToMatchBySongId={(_, __, songId, editSongId) => onEditSongToMatchBySongId(songId, editSongId)}
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
        open={editMatchNotesModalOpen}
        onClose={() => setEditMatchNotesModalOpen(false)}
        onSave={onEditMatchNotes}
      />

      <MatchHeader
        match={match}
        controls={controls}
        onOpenEditNotes={() => setEditMatchNotesModalOpen(true)}
        onDeleteMatch={onDeleteMatch}
        onOpenAddSong={() => setAddSongToMatchModalOpen(true)}
      />

      <StandingsTable
        match={match}
        controls={controls}
        scoreTable={scoreTable}
        sortedPlayers={sortedPlayers}
        onOpenEditSong={(songId) => {
          setEditSongId(songId);
          setAddSongToMatchModalOpen(true);
        }}
        onOpenAddStanding={(playerId, songId, playerName, songTitle) =>
          setStandingModal({ open: true, mode: "add", playerId, songId, playerName, songTitle })
        }
        onOpenEditStanding={(playerId, songId, playerName, songTitle, percentage, score, isFailed) =>
          setStandingModal({ open: true, mode: "edit", playerId, songId, playerName, songTitle, initialPercentage: percentage, initialScore: score, initialIsFailed: isFailed })
        }
        onDisablePlayer={(playerId, songId) => onAddStandingToMatch(playerId, songId, -1, 0, true)}
        onDeleteStanding={onDeleteStanding}
      />
    </div>
  );
}
