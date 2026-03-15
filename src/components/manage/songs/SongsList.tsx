import {
  faFileImport,
  faLayerGroup,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Song } from "../../../models/Song";
import axios from "axios";
import { toast } from "react-toastify";

interface SongScore {
  playerName: string;
  percentage: number;
  isFailed: boolean;
}
import Select from "react-select";

type SongsListProps = {
  canEdit?: boolean;
  tournamentId?: number;
};

export default function SongsList({ canEdit = true, tournamentId }: SongsListProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState<string>("");
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");

  const [selectedSongId, setSelectedSongId] = useState<number>(-1);

  useEffect(() => {
    const url = tournamentId ? `songs?tournamentId=${tournamentId}` : "songs";
    axios.get<Song[]>(url).then((response) => {
      const { data } = response;
      setSongs(data);
      setGroups([...new Set(data.map((s) => s.group))]);
      setSelectedGroupName(data.length > 0 ? data[0].group : "");
      setSelectedSongId(-1);
    });
  }, [tournamentId]);

  const addNewSongInGroup = () => {
    const title = prompt("Enter song title");

    if (!title) return;

    const difficulty = prompt("Enter song difficulty");

    if (title && difficulty) {
      axios
        .post<Song>("songs", { title, difficulty, group: selectedGroupName, tournamentId })
        .then((response) => {
          setSongs([...songs, response.data]);
        });
    }
  };

  const addNewSongInNewGroup = () => {
    const title = prompt("Enter song title");

    if (!title) return;

    const difficulty = prompt("Enter song difficulty");

    if (!difficulty) return;

    const group = prompt("Enter group name");

    if (group && groups.includes(group)) return alert("Group already exists");

    if (title && difficulty && group) {
      axios
        .post<Song>("songs", { title, difficulty, group, tournamentId })
        .then((response) => {
          setSongs([...songs, response.data]);
          setGroups([...groups, group]);
          setSelectedGroupName(group);
        });
    }
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
        .filter((r): r is PromiseFulfilledResult<{ data: Song }> => r.status === "fulfilled")
        .map((r) => r.value.data);
      const failed = results.filter((r) => r.status === "rejected").length;
      setSongs((prev) => {
        const merged = [...prev, ...created];
        setGroups([...new Set(merged.map((s) => s.group))]);
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
        setSongs(songs.filter((p) => p.id !== id));
        setSelectedSongId(-1);
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-start gap-3">
        <div className="flex flex-row gap-3">
          <h2 className="text-rossoTesto">Songs List</h2>
          {canEdit && (
            <>
              <button
                title={
                  !selectedGroupName
                    ? "plz select group"
                    : "Add song in selected group"
                }
                disabled={!selectedGroupName}
                onClick={addNewSongInGroup}
                className="disabled:opacity-50 w-4 text-green-700"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button
                title={"Add song in new group"}
                onClick={addNewSongInNewGroup}
                className="disabled:opacity-50 w-4 text-green-700"
              >
                <FontAwesomeIcon icon={faLayerGroup} />
              </button>
              <button
                title="Bulk import songs from JSON"
                onClick={() => fileInputRef.current?.click()}
                className="w-4 text-green-700"
              >
                <FontAwesomeIcon icon={faFileImport} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleBulkImport}
              />
            </>
          )}
        </div>
        <Select
          options={groups.map((g) => {
            return { value: g, label: g };
          })}
          placeholder="Select group..."
          className="w-[300px]"
          value={
            selectedGroupName
              ? { value: selectedGroupName, label: selectedGroupName }
              : null
          }
          onChange={(selected) =>
            selected
              ? setSelectedGroupName(selected.value)
              : setSelectedGroupName("")
          }
        ></Select>
        <div className="flex flex-row gap-3">
          <div className="relative bg-gray-100 text-gray-800 w-[400px] h-[400px] overflow-auto">
            <input
              className="p-1 w-full sticky inset-0 border-blu border outline-none"
              type="search"
              placeholder="Search song..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {songs
              .filter((s) => {
                const isInGroup = s.group === selectedGroupName;

                const found =
                  search.length < 0
                    ? true
                    : s.title.toLowerCase().includes(search.toLowerCase());

                return isInGroup && found;
              })
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((song) => {
                return (
                  <div
                    key={song.id}
                    role="button"
                    onClick={() => setSelectedSongId(song.id)}
                    className={`${
                      selectedSongId === song.id
                        ? "bg-rossoTag text-white"
                        : "hover:bg-rossoTag hover:text-white"
                    } cursor-pointer py-2 px-3 flex justify-between items-center gap-3 `}
                  >
                    <span>{song.title}</span>
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSong(song.id);
                        }}
                        className="text-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                );
              })}
            {search.length > 0 &&
              songs.filter((s) =>
                s.title.toLowerCase().includes(search.toLowerCase()),
              ).length === 0 && (
                <div className="text-center py-2 text-rossoTesto">
                  No song found
                </div>
              )}
          </div>
          <div>
            {selectedSongId < 0 && (
              <div>Select a song from the list to view informations.</div>
            )}
            {selectedSongId >= 0 && (
              <SongItem
                song={songs.find((s) => s.id === selectedSongId) as Song}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SongItem({ song }: { song: Song }) {
  const [scores, setScores] = useState<SongScore[]>([]);

  useEffect(() => {
    axios
      .get<{ player: { playerName: string }; percentage: number; isFailed: boolean }[]>(
        `songs/${song.id}/scores`,
      )
      .then((r) =>
        setScores(
          r.data.map((s) => ({
            playerName: s.player?.playerName ?? "Unknown",
            percentage: s.percentage,
            isFailed: s.isFailed,
          })),
        ),
      )
      .catch(() => setScores([]));
  }, [song.id]);

  return (
    <div className="text-red-400">
      <h3 className="text-2xl text-rossoTesto">Song Information</h3>
      <div className="mt-2">
        <h3 className=" text-rossoTesto">Title: </h3>
        <span>{song.title}</span>
      </div>
      <div className="mt-2">
        <h3 className="text-rossoTesto">Difficulty: </h3>
        <div className="flex flex-row items-center ml-1 gap-1">
          {[...Array(13)].map((_, i) => (
            <span
              key={i}
              className={`${
                i + 1 <= song.difficulty ? "bg-rossoTesto" : "bg-gray-300"
              } h-4 rounded-sm w-2 `}
            ></span>
          ))}

          <span className="ml-2 font-bold">{song.difficulty}</span>
        </div>
      </div>
      <h3 className="mt-3 text-rossoTesto">Player Scores</h3>
      {scores.length === 0 ? (
        <p>No scores on record for this song.</p>
      ) : (
        <ul className="mt-1 flex flex-col gap-1">
          {scores.map((s, i) => (
            <li key={i} className="text-gray-800 text-sm">
              {s.playerName} - {Number(s.percentage).toFixed(2)}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
