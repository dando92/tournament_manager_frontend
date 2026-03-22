import { Match } from "@/features/match/types/Match";
import { Division } from "@/features/division/types/Division";
import AddEditSongToMatchModal from "@/features/match/modals/AddEditSongToMatchModal";
import { useEffect, useRef, useState } from "react";
import StandingModal from "@/features/match/modals/StandingModal";
import EditMatchNotesModal from "@/features/match/modals/EditMatchNotesModal";
import MatchHeader from "@/features/match/components/MatchHeader";
import MatchTable from "@/features/match/components/MatchTable";

type MatchCardProps = {
  division: Division;
  match: Match;
  allMatches: Match[];
  controls?: boolean;
  tournamentId?: number;
  matchUpdateSignal?: number;
  highlightedMatchId?: number | null;
  onHighlightMatch?: (id: number | null) => void;
  onMatchUpdated: () => void;
  onDeleteMatch: (matchId: number) => void;
  onAddSongToMatchByRoll: (group: string, level: string) => void;
  onAddSongToMatchBySongId: (songId: number) => void;
  onEditSongToMatchByRoll: (group: string, level: string, editSongId: number) => void;
  onEditSongToMatchBySongId: (songId: number, editSongId: number) => void;
  onDeleteSongFromMatch: (songId: number) => void;
  onAddStandingToMatch: (
    playerId: number,
    songId: number,
    percentage: number,
    score: number,
    isFailed: boolean,
  ) => void;
  onEditMatchNotes: (matchId: number, notes: string) => void;
  onRenameMatch?: (matchId: number, name: string) => void;
  onEditStanding: (
    playerId: number,
    songId: number,
    percentage: number,
    score: number,
    isFailed: boolean,
  ) => void;
  onDeleteStanding: (playerId: number, songId: number) => void;
  onUpdateMatchPaths?: (matchId: number, sourcePaths: number[]) => Promise<void>;
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

export default function MatchCard({
  division,
  match,
  allMatches,
  controls = false,
  tournamentId,
  matchUpdateSignal,
  highlightedMatchId = null,
  onHighlightMatch = () => {},
  onMatchUpdated,
  onDeleteMatch,
  onAddSongToMatchByRoll,
  onAddSongToMatchBySongId,
  onEditSongToMatchByRoll,
  onEditSongToMatchBySongId,
  onDeleteSongFromMatch,
  onAddStandingToMatch,
  onEditMatchNotes,
  onRenameMatch,
  onDeleteStanding,
  onEditStanding,
  onUpdateMatchPaths,
}: MatchCardProps) {
  const [addSongToMatchModalOpen, setAddSongToMatchModalOpen] = useState(false);
  const [editSongId, setEditSongId] = useState<number | null>(null);
  const [standingModal, setStandingModal] = useState<StandingModalState>(closedModal);
  const [editMatchNotesModalOpen, setEditMatchNotesModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pendingSourcePaths, setPendingSourcePaths] = useState<(number | null)[]>([]);

  const onMatchUpdatedRef = useRef(onMatchUpdated);
  useEffect(() => { onMatchUpdatedRef.current = onMatchUpdated; });

  useEffect(() => {
    if (!matchUpdateSignal) return;
    onMatchUpdatedRef.current();
  }, [matchUpdateSignal]);

  const maxPlayersPerMatch = division.playersPerMatch ?? 2;
  const isHighlighted = match.id === highlightedMatchId;

  function enterEditMode() {
    const existing = match.sourcePaths ?? [];
    const slots = Math.max(0, maxPlayersPerMatch - (match.players?.length ?? 0));
    const initial: (number | null)[] = Array.from({ length: slots }, (_, i) => existing[i] ?? null);
    setPendingSourcePaths(initial);
    setEditMode(true);
  }

  function cancelEditMode() {
    setEditMode(false);
    setPendingSourcePaths([]);
  }

  async function saveEditMode() {
    const newSourcePaths = pendingSourcePaths.filter((id): id is number => id !== null);
    if (onUpdateMatchPaths) {
      await onUpdateMatchPaths(match.id, newSourcePaths);
    }
    onMatchUpdatedRef.current();
    setEditMode(false);
    setPendingSourcePaths([]);
  }

  return (
    <div
      className={`flex flex-col w-full p-4 my-3 border rounded-xl bg-white shadow-sm transition-shadow ${
        isHighlighted
          ? "border-green-400 ring-2 ring-green-300 shadow-green-100 shadow-lg"
          : "border-gray-100"
      }`}
    >
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
        onRenameMatch={onRenameMatch}
        editMode={editMode}
        canEditRoutes={(match.players?.length ?? 0) < maxPlayersPerMatch}
        onEditRoutes={enterEditMode}
        onSaveRoutes={saveEditMode}
        onCancelRoutes={cancelEditMode}
      />

      <MatchTable
        match={match}
        allMatches={allMatches}
        maxPlayersPerMatch={maxPlayersPerMatch}
        controls={controls}
        editMode={editMode}
        highlightedMatchId={highlightedMatchId}
        onHighlightMatch={onHighlightMatch}
        pendingSourcePaths={pendingSourcePaths}
        onPendingSourcePathChange={(index, matchId) => {
          setPendingSourcePaths((prev) => {
            const next = [...prev];
            next[index] = matchId;
            return next;
          });
        }}
        onOpenEditSong={(songId) => {
          setEditSongId(songId);
          setAddSongToMatchModalOpen(true);
        }}
        onDeleteSong={onDeleteSongFromMatch}
        onOpenAddStanding={(playerId, songId, playerName, songTitle) =>
          setStandingModal({ open: true, mode: "add", playerId, songId, playerName, songTitle })
        }
        onOpenEditStanding={(playerId, songId, playerName, songTitle, percentage, score, isFailed) =>
          setStandingModal({ open: true, mode: "edit", playerId, songId, playerName, songTitle, initialPercentage: percentage, initialScore: score, initialIsFailed: isFailed })
        }
        onDeleteStanding={onDeleteStanding}
      />
    </div>
  );
}
