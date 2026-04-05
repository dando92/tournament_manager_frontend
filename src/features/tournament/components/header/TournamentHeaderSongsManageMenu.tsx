import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faFileImport, faLayerGroup, faPlus } from "@fortawesome/free-solid-svg-icons";
import CreateSongModal from "@/features/song/modals/CreateSongModal";
import { Song } from "@/features/song/types/Song";
import { btnPrimary } from "@/styles/buttonStyles";

type Props = {
  tournamentId: number;
  songsVersion: number;
  refreshSongs: () => void;
};

export default function TournamentHeaderSongsManageMenu({
  tournamentId,
  songsVersion,
  refreshSongs,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loadingSongsMeta, setLoadingSongsMeta] = useState(false);
  const [addInGroupOpen, setAddInGroupOpen] = useState(false);
  const [addInNewGroupOpen, setAddInNewGroupOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoadingSongsMeta(true);
    axios
      .get<Song[]>(`songs?tournamentId=${tournamentId}`)
      .then((response) => {
        setSongs(response.data);
      })
      .catch(() => {})
      .finally(() => setLoadingSongsMeta(false));
  }, [songsVersion, tournamentId]);

  const songGroups = useMemo(
    () => [...new Set(songs.map((song) => song.group))].sort(),
    [songs],
  );
  const selectedGroupName = songGroups[0] ?? "";

  function handleCreateSong(
    title: string,
    difficulty: number,
    group: string,
    artist?: string,
  ) {
    axios
      .post<Song>("songs", { title, artist, difficulty, group, tournamentId })
      .then(() => {
        refreshSongs();
        toast.success("Song created.");
      })
      .catch(() => {
        toast.error("Failed to create song.");
      });
  }

  async function handleBulkImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        toast.error("JSON must be an array of songs.");
        return;
      }

      const results = await Promise.allSettled(
        data.map((dto) => axios.post<Song>("songs", { ...dto, tournamentId })),
      );
      const created = results.filter((result) => result.status === "fulfilled").length;
      const failed = results.filter((result) => result.status === "rejected").length;
      refreshSongs();

      if (failed > 0) {
        toast.warn(`Imported ${created} songs. ${failed} failed.`);
      } else {
        toast.success(`Imported ${created} songs.`);
      }
    } catch {
      toast.error("Failed to parse JSON file.");
    }
  }

  return (
    <>
      <CreateSongModal
        open={addInGroupOpen}
        onClose={() => setAddInGroupOpen(false)}
        initialGroup={selectedGroupName}
        onCreate={handleCreateSong}
      />
      <CreateSongModal
        open={addInNewGroupOpen}
        onClose={() => setAddInNewGroupOpen(false)}
        existingGroups={songGroups}
        onCreate={handleCreateSong}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleBulkImport}
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className={`flex items-center gap-2 ${btnPrimary}`}
        >
          Manage
          <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[180px]">
              <button
                type="button"
                disabled={!selectedGroupName || loadingSongsMeta}
                onClick={() => {
                  setMenuOpen(false);
                  setAddInGroupOpen(true);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faPlus} className="text-primary-dark" />
                Add song
              </button>
              <button
                type="button"
                disabled={loadingSongsMeta}
                onClick={() => {
                  setMenuOpen(false);
                  setAddInNewGroupOpen(true);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faLayerGroup} className="text-primary-dark" />
                New pack
              </button>
              <button
                type="button"
                disabled={loadingSongsMeta}
                onClick={() => {
                  setMenuOpen(false);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faFileImport} className="text-primary-dark" />
                Import
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
