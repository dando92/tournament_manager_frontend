import {
  faFileImport,
  faLayerGroup,
  faPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import { Song } from "@/features/song/types/Song";
import { btnPrimary } from "@/styles/buttonStyles";
import axios from "axios";
import { toast } from "react-toastify";
import CreateSongModal from "@/features/song/modals/CreateSongModal";
import SongListView from "./SongListView";

type SongsListProps = {
  canEdit?: boolean;
  tournamentId?: number;
};

export default function SongsList({ canEdit = true, tournamentId }: SongsListProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [packFilter, setPackFilter] = useState("");
  const [songSearch, setSongSearch] = useState("");

  const [addInGroupOpen, setAddInGroupOpen] = useState(false);
  const [addInNewGroupOpen, setAddInNewGroupOpen] = useState(false);

  useEffect(() => {
    const url = tournamentId ? `songs?tournamentId=${tournamentId}` : "songs";
    axios.get<Song[]>(url).then((response) => {
      const { data } = response;
      setSongs(data);
      setGroups([...new Set(data.map((s) => s.group))].sort());
    });
  }, [tournamentId]);

  const selectedGroupName = groups[0] ?? "";

  const handleCreateSong = (title: string, difficulty: number, group: string, artist?: string) => {
    axios
      .post<Song>("songs", { title, artist, difficulty, group, tournamentId })
      .then((response) => {
        setSongs((prev) => {
          const merged = [...prev, response.data];
          setGroups([...new Set(merged.map((s) => s.group))].sort());
          return merged;
        });
      });
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        toast.error("JSON must be an array of songs.");
        return;
      }
      const results = await Promise.allSettled(
        data.map((dto) => axios.post<Song>("songs", { ...dto, tournamentId }))
      );
      const created = results
        .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof axios.post<Song>>>> => r.status === "fulfilled")
        .map((r) => r.value.data);
      const failed = results.filter((r) => r.status === "rejected").length;
      setSongs((prev) => {
        const merged = [...prev, ...created];
        setGroups([...new Set(merged.map((s) => s.group))].sort());
        return merged;
      });
      if (failed > 0) {
        toast.warn(`Imported ${created.length} songs. ${failed} failed.`);
      } else {
        toast.success(`Imported ${created.length} songs.`);
      }
    } catch {
      toast.error("Failed to parse JSON file.");
    }
  };

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
      <CreateSongModal
        open={addInGroupOpen}
        onClose={() => setAddInGroupOpen(false)}
        initialGroup={selectedGroupName}
        onCreate={handleCreateSong}
      />
      <CreateSongModal
        open={addInNewGroupOpen}
        onClose={() => setAddInNewGroupOpen(false)}
        existingGroups={groups}
        onCreate={handleCreateSong}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleBulkImport}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-primary-dark font-bold text-xl">Songs</h2>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              title={!selectedGroupName ? "No groups yet" : "Add song to current pack"}
              disabled={!selectedGroupName}
              onClick={() => setAddInGroupOpen(true)}
              className={`${btnPrimary} flex items-center gap-1.5 text-sm`}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span className="hidden sm:inline">Add song</span>
            </button>
            <button
              title="Add song in new pack"
              onClick={() => setAddInNewGroupOpen(true)}
              className={`${btnPrimary} flex items-center gap-1.5 text-sm`}
            >
              <FontAwesomeIcon icon={faLayerGroup} />
              <span className="hidden sm:inline">New pack</span>
            </button>
            <button
              title="Bulk import songs from JSON"
              onClick={() => fileInputRef.current?.click()}
              className={`${btnPrimary} flex items-center gap-1.5 text-sm`}
            >
              <FontAwesomeIcon icon={faFileImport} />
              <span className="hidden sm:inline">Import</span>
            </button>
          </div>
        )}
      </div>

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
