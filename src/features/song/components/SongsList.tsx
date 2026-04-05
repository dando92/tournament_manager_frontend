import {
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Song } from "@/features/song/types/Song";
import axios from "axios";
import SongListView from "./SongListView";

type SongsListProps = {
  canEdit?: boolean;
  tournamentId?: number;
  songsVersion?: number;
};

export default function SongsList({ canEdit = true, tournamentId, songsVersion = 0 }: SongsListProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  const [packFilter, setPackFilter] = useState("");
  const [songSearch, setSongSearch] = useState("");

  useEffect(() => {
    const url = tournamentId ? `songs?tournamentId=${tournamentId}` : "songs";
    axios.get<Song[]>(url).then((response) => {
      const { data } = response;
      setSongs(data);
      setGroups([...new Set(data.map((s) => s.group))].sort());
    });
  }, [songsVersion, tournamentId]);

  const deleteSong = (id: number) => {
    if (window.confirm("Are you sure you want to delete this song?")) {
      axios.delete(`songs/${id}`).then(() => {
        setSongs((prev) => {
          const merged = prev.filter((s) => s.id !== id);
          setGroups([...new Set(merged.map((s) => s.group))].sort());
          return merged;
        });
      });
    }
  };

  const deletePack = (pack: string) => {
    const packSongs = songs.filter((s) => s.group === pack);
    if (!window.confirm(`Delete all ${packSongs.length} song(s) in pack "${pack}"?`)) return;
    Promise.allSettled(packSongs.map((s) => axios.delete(`songs/${s.id}`))).then(() => {
      setSongs((prev) => {
        const merged = prev.filter((s) => s.group !== pack);
        setGroups([...new Set(merged.map((s) => s.group))].sort());
        return merged;
      });
    });
  };

  const packOptions = useMemo(() => groups, [groups]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
      {/* Search / filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Pack filter */}
        <div className="relative sm:w-48 shrink-0">
          <select
            value={packFilter}
            onChange={(e) => setPackFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary-dark/30"
          >
            <option value="">All packs</option>
            {packOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
        </div>

        {/* Song search */}
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          />
          <input
            type="search"
            placeholder="Search by title or artist…"
            value={songSearch}
            onChange={(e) => setSongSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/30"
          />
        </div>
      </div>

      {/* Song list */}
      <SongListView
        songs={songs}
        packFilter={packFilter}
        songSearch={songSearch}
        canEdit={canEdit}
        onDelete={deleteSong}
        onDeletePack={deletePack}
      />
    </div>
  );
}
