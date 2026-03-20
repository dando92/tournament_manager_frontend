import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Song } from "@/models/Song";
import { btnTrash } from "@/styles/buttonStyles";

interface SongScore {
  playerName: string;
  percentage: number;
  isFailed: boolean;
}

function difficultyColor(difficulty: number): string {
  if (difficulty <= 3) return "bg-green-500";
  if (difficulty <= 6) return "bg-yellow-500";
  if (difficulty <= 9) return "bg-orange-500";
  if (difficulty <= 12) return "bg-red-600";
  return "bg-purple-700";
}

function scoreBadgeClass(percentage: number, isFailed: boolean): string {
  if (isFailed) return "bg-red-100 text-red-700 border-red-200";
  if (percentage >= 99) return "bg-purple-100 text-purple-800 border-purple-200";
  if (percentage >= 95) return "bg-blue-100 text-blue-800 border-blue-200";
  if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
  if (percentage >= 80) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

type Props = {
  song: Song;
  canEdit: boolean;
  onDelete: (id: number) => void;
};

export default function SongRow({ song, canEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<SongScore[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || scores !== null) return;
    setLoading(true);
    axios
      .get<{ player: { playerName: string }; percentage: number; isFailed: boolean }[]>(
        `songs/${song.id}/scores`,
      )
      .then((r) =>
        setScores(
          r.data.map((s) => ({
            playerName: s.player?.playerName ?? "Unknown",
            percentage: Number(s.percentage),
            isFailed: s.isFailed,
          })),
        ),
      )
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [open, song.id, scores]);

  const sorted = scores
    ? [...scores].sort((a, b) =>
        a.isFailed !== b.isFailed ? (a.isFailed ? 1 : -1) : b.percentage - a.percentage,
      )
    : [];

  const label = song.artist ? `${song.artist} - ${song.title}` : song.title;

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Row */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors select-none"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Difficulty badge */}
        <span
          className={`${difficultyColor(song.difficulty)} text-white text-xs font-bold w-7 h-7 flex items-center justify-center rounded shrink-0`}
        >
          {song.difficulty}
        </span>

        {/* Title / artist */}
        <span className="flex-1 text-sm text-gray-800 truncate">{label}</span>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <button
              onClick={() => onDelete(song.id)}
              className={`${btnTrash} text-sm`}
              title="Delete song"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
          <FontAwesomeIcon
            icon={open ? faChevronUp : faChevronDown}
            className="text-gray-400 text-xs w-3"
          />
        </div>
      </div>

      {/* Scores panel */}
      {open && (
        <div className="px-4 pb-3 bg-gray-50">
          {loading && <p className="text-xs text-gray-400 py-2">Loading scores…</p>}
          {!loading && sorted.length === 0 && (
            <p className="text-xs text-gray-400 py-2 italic">No scores recorded.</p>
          )}
          {!loading && sorted.length > 0 && (
            <ul className="flex flex-col gap-1 pt-1">
              {sorted.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 rounded border bg-white text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-400 w-5 text-right shrink-0">#{i + 1}</span>
                    <span className="text-gray-800 truncate">{s.playerName}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border shrink-0 ${scoreBadgeClass(s.percentage, s.isFailed)}`}
                  >
                    {s.isFailed ? "FAILED" : `${s.percentage.toFixed(2)}%`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
