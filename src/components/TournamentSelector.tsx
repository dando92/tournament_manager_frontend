import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { Tournament } from "@/models/Tournament";

type Props = {
  tournaments: Tournament[];
  onSelect: (t: Tournament) => void;
  /** Shown top-right of the title (e.g. "New Tournament" button) */
  headerAction?: React.ReactNode;
  /** Show the #id badge on each row */
  showId?: boolean;
  /** Extra actions rendered at the end of each row (e.g. delete button) */
  extraRowAction?: (t: Tournament) => React.ReactNode;
  loading?: boolean;
  error?: string | null;
};

export default function TournamentSelector({
  tournaments,
  onSelect,
  headerAction,
  showId,
  extraRowAction,
  loading,
  error,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? tournaments.filter((t) =>
        t.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : tournaments;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-rossoTesto">Select Tournament</h1>
        {headerAction}
      </div>

      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search tournament..."
        className="w-full border-2 border-gray-300 focus:border-rossoTesto outline-none rounded-lg px-4 py-3 text-gray-700 text-base"
      />

      {/* List */}
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <p className="text-gray-500">No tournaments found.</p>
          )}
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelect(t)}
              className="flex flex-row items-center gap-4 bg-gray-100 hover:bg-gray-200 cursor-pointer px-5 py-4 rounded-lg"
            >
              <FontAwesomeIcon
                icon={faTrophy}
                className="text-rossoTesto text-xl shrink-0"
              />
              <span className="text-lg font-semibold text-gray-800">
                {t.name}
              </span>
              {showId && (
                <span className="text-gray-400 text-sm ml-auto">#{t.id}</span>
              )}
              {extraRowAction && (
                <span
                  className={showId ? "" : "ml-auto"}
                  onClick={(e) => e.stopPropagation()}
                >
                  {extraRowAction(t)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
