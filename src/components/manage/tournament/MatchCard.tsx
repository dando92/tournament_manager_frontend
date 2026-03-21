import { Match } from "@/models/Match";
import { Division } from "@/models/Division";
import AddEditSongToMatchModal from "@/components/modals/AddEditSongToMatchModal";
import { useEffect, useRef, useState } from "react";
import StandingModal from "@/components/modals/StandingModal";
import EditMatchNotesModal from "@/components/modals/EditMatchNotesModal";
import MatchHeader from "@/components/manage/tournament/MatchHeader";
import MatchTable from "@/components/manage/tournament/MatchTable";

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
  onAddStandingToMatch,
  onEditMatchNotes,
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
      />

      {controls && (
        <div className="flex items-center gap-2 mb-2">
          {editMode ? (
            <>
              <button
                onClick={saveEditMode}
                className="text-xs text-white bg-green-600 hover:bg-green-700 font-medium rounded px-2 py-1 transition-colors"
              >
                Save
              </button>
              <button
                onClick={cancelEditMode}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (match.players?.length ?? 0) < maxPlayersPerMatch ? (
            <button
              onClick={enterEditMode}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
            >
              Edit match routes
            </button>
          ) : null}
        </div>
      )}

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
