import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faStickyNote, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Match } from "@/models/Match";
import { btnTrash } from "@/styles/buttonStyles";

type Props = {
  match: Match;
  controls: boolean;
  onOpenEditNotes: () => void;
  onDeleteMatch: (matchId: number) => void;
  onOpenAddSong: () => void;
};

export default function MatchHeader({
  match,
  controls,
  onOpenEditNotes,
  onDeleteMatch,
  onOpenAddSong,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-800">{match.name}</h3>
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
        </div>
        {match.subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{match.subtitle}</p>
        )}
      </div>
      {controls && (
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAddSong}
            title="Add song/round"
            className="text-green-700 hover:text-green-900 text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
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
