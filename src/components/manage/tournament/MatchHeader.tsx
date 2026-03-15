import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faPlus, faStickyNote, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Match } from "@/models/Match";

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
    <div className="flex flex-row mb-6 justify-center items-center">
      <div>
        <h2 className="text-center text-4xl font-bold text-rossoTesto">
          <div className="flex flex-row justify-center items-center gap-3">
            <span className="text-xl">{match.name}</span>
            {controls && (
              <button
                className="text-lg"
                title={match.notes ? match.notes : "Add notes"}
                onClick={onOpenEditNotes}
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
      {controls && (
        <div className="ml-3 bg-gray-300 rounded-xl p-3 flex flex-row gap-3">
          <button
            title="Add a new round/song to the match"
            onClick={onOpenAddSong}
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
  );
}
