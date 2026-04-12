import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faStickyNote, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Match } from "@/features/match/types/Match";
import { btnTrash } from "@/styles/buttonStyles";

type Props = {
  match: Match;
  controls: boolean;
  onOpenEditNotes: () => void;
  onDeleteMatch: (matchId: number) => void;
  onOpenAddSong: () => void;
  onRenameMatch?: (matchId: number, name: string) => void;
  editMode?: boolean;
  canEditRoutes?: boolean;
  onEditRoutes?: () => void;
  onSaveRoutes?: () => void;
  onCancelRoutes?: () => void;
};

export default function MatchHeader({
  match,
  controls,
  onOpenEditNotes,
  onDeleteMatch,
  onOpenAddSong,
  onRenameMatch,
  editMode = false,
  canEditRoutes = false,
  onEditRoutes,
  onSaveRoutes,
  onCancelRoutes,
}: Props) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) inputRef.current?.focus();
  }, [isRenaming]);

  function startRename() {
    setRenameValue(match.name);
    setIsRenaming(true);
  }

  function commitRename() {
    const trimmed = renameValue.trim();
    setIsRenaming(false);
    if (trimmed && trimmed !== match.name && onRenameMatch) {
      onRenameMatch(match.id, trimmed);
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <div className="flex items-center gap-2">
          {controls && isRenaming ? (
            <input
              ref={inputRef}
              className="text-base font-semibold text-gray-800 border-b border-primary-dark outline-none bg-transparent w-40"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setIsRenaming(false);
              }}
            />
          ) : (
            <h3
              className={`text-base font-semibold text-gray-800 ${controls ? "cursor-pointer hover:text-primary-dark transition-colors" : ""}`}
              onClick={controls ? startRename : undefined}
              title={controls ? "Click to rename" : undefined}
            >
              {match.name}
            </h3>
          )}
          {controls ? (
            <button
              onClick={onOpenEditNotes}
              title={match.notes || "Add notes"}
              className={`text-sm ${match.notes ? "text-amber-500 hover:text-amber-700" : "text-gray-300 hover:text-gray-500"}`}
            >
              <FontAwesomeIcon icon={faStickyNote} />
            </button>
          ) : match.notes ? (
            <span title={match.notes} className="text-amber-400 cursor-help text-sm">
              <FontAwesomeIcon icon={faStickyNote} />
            </span>
          ) : null}
          {controls && (
            editMode ? (
              <>
                <button
                  onClick={onSaveRoutes}
                  className="text-xs text-white bg-green-600 hover:bg-green-700 font-medium rounded px-2 py-0.5 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={onCancelRoutes}
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : canEditRoutes ? (
              <button
                onClick={onEditRoutes}
                className="text-xs text-primary-dark font-medium border border-primary-dark/30 rounded px-2 py-0.5 hover:bg-primary-dark/10 transition-colors"
              >
                Edit routes
              </button>
            ) : null
          )}
        </div>
        {match.subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{match.subtitle}</p>
        )}
      </div>
      {controls && (
        <div className="flex items-center gap-3 shrink-0">
          {(match.entrants?.length ?? 0) > 0 && (
            <button
              onClick={onOpenAddSong}
              title="Add song/round"
              className="inline-flex items-center gap-1 text-green-700 hover:text-green-900 text-sm font-medium"
            >
              <FontAwesomeIcon icon={faPlus} className="sm:hidden" />
              <span className="hidden sm:inline-flex items-center gap-1">
                <FontAwesomeIcon icon={faPlus} />
                <span>Add song</span>
              </span>
            </button>
          )}
          <button
            onClick={() => onDeleteMatch(match.id)}
            title="Delete match"
            className={`text-sm ${btnTrash}`}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      )}
    </div>
  );
}
