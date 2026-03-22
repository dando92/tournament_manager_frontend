import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Song } from "@/models/Song";
import { btnTrash } from "@/styles/buttonStyles";
import SongRow from "./SongRow";

type Props = {
  songs: Song[];
  packFilter: string;
  songSearch: string;
  canEdit: boolean;
  onDelete: (id: number) => void;
  onDeletePack: (pack: string) => void;
};

export default function SongListView({ songs, packFilter, songSearch, canEdit, onDelete, onDeletePack }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = songSearch.toLowerCase();
    return songs
      .filter((s) => {
        const matchesPack = !packFilter || s.group === packFilter;
        const matchesSong =
          !q ||
          s.title.toLowerCase().includes(q) ||
          (s.artist ?? "").toLowerCase().includes(q);
        return matchesPack && matchesSong;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [songs, packFilter, songSearch]);

  const grouped = useMemo(() => {
    const map = new Map<string, Song[]>();
    for (const song of filtered) {
      const list = map.get(song.group) ?? [];
      list.push(song);
      map.set(song.group, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  function toggleCollapse(pack: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(pack) ? next.delete(pack) : next.add(pack);
      return next;
    });
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm italic">
        No songs match your search.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {grouped.map(([pack, packSongs]) => {
        const isCollapsed = collapsed.has(pack);
        return (
          <div key={pack} className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white">
            {/* Pack header */}
            <div className="px-3 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2">
              {/* Collapse toggle */}
              <button
                onClick={() => toggleCollapse(pack)}
                className="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                title={isCollapsed ? "Expand pack" : "Collapse pack"}
              >
                <FontAwesomeIcon icon={isCollapsed ? faChevronDown : faChevronUp} className="w-3" />
              </button>

              {/* Pack name */}
              <span className="flex-1 truncate">{pack}</span>

              {/* Song count */}
              <span className="font-normal opacity-70 shrink-0">
                {packSongs.length} song{packSongs.length !== 1 ? "s" : ""}
              </span>

              {/* Delete pack */}
              {canEdit && (
                <button
                  onClick={() => onDeletePack(pack)}
                  className={`${btnTrash} shrink-0 ml-1`}
                  title={`Delete pack "${pack}"`}
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3" />
                </button>
              )}
            </div>

            {/* Songs */}
            {!isCollapsed && packSongs.map((song) => (
              <SongRow
                key={song.id}
                song={song}
                canEdit={canEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
