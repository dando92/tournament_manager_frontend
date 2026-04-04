import { useEffect, useMemo, useState } from "react";
import OkModal from "@/shared/components/ui/OkModal";
import { Song } from "@/features/song/types/Song";
import axios from "axios";
import Select from "react-select";
import { selectPortalStyles } from "@/styles/selectStyles";
import { btnSecondary } from "@/styles/buttonStyles";

type AddSongToMatchModalProps = {
  divisionId: number;
  matchId: number;
  songId?: number | null;
  tournamentId?: number;
  open: boolean;
  onClose: () => void;
  onAddSongToMatchByRoll: (
    divisionId: number,
    matchId: number,
    group: string,
    level: string,
  ) => void;
  onAddSongToMatchBySongId: (
    divisionId: number,
    matchId: number,
    songId: number,
  ) => void;
  onEditSongToMatchByRoll: (
    divisionId: number,
    matchId: number,
    group: string,
    level: string,
    editSongId: number,
  ) => void;
  onEditSongToMatchBySongId: (
    divisionId: number,
    matchId: number,
    songId: number,
    editSongId: number,
  ) => void;
};

export default function AddEditSongToMatchModal({
  divisionId,
  matchId,
  songId,
  tournamentId,
  open,
  onClose,
  onAddSongToMatchByRoll,
  onAddSongToMatchBySongId,
  onEditSongToMatchByRoll,
  onEditSongToMatchBySongId,
}: AddSongToMatchModalProps) {
  const [songAddType, setSongAddType] = useState<"title" | "roll">("roll");

  // if by roll
  const [difficultyInput, setDifficultyInput] = useState<string>("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [songGroups, setSongGroups] = useState<string[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");

  // if by title
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songSearch, setSongSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    const url = tournamentId ? `songs?tournamentId=${tournamentId}` : `songs`;
    axios.get<Song[]>(url).then((response) => {
      setSongs(response.data);
      setSongGroups([...new Set(response.data.map((s) => s.group))]);
      if (response.data.length > 0)
        setSelectedGroupName(response.data[0].group);
    });
    setSongSearch("");
    setSelectedSong(null);
  }, [open, tournamentId]);

  const filteredSongs = useMemo(
    () =>
      songs.filter((song) => {
        const matchesGroup = !selectedGroupName || song.group === selectedGroupName;
        const query = songSearch.trim().toLowerCase();
        const matchesSearch =
          !query ||
          song.title.toLowerCase().includes(query) ||
          (song.artist ?? "").toLowerCase().includes(query);
        return matchesGroup && matchesSearch;
      }),
    [songs, selectedGroupName, songSearch],
  );

  useEffect(() => {
    if (selectedSong && !filteredSongs.some((song) => song.id === selectedSong.id)) {
      setSelectedSong(null);
    }
  }, [filteredSongs, selectedSong]);

  const onSubmit = () => {
    switch (songAddType) {
      case "roll":
        createRoundByRoll();
        break;
      case "title":
        createRoundBySongId();
        break;
    }
  };

  const createRoundByRoll = () => {
    if (selectedGroupName && difficultyInput) {
      songId
        ? onEditSongToMatchByRoll(divisionId, matchId, selectedGroupName, difficultyInput, songId)
        : onAddSongToMatchByRoll(divisionId, matchId, selectedGroupName, difficultyInput);
      onClose();
    }
  };

  const createRoundBySongId = () => {
    if (selectedSong) {
      songId
        ? onEditSongToMatchBySongId(divisionId, matchId, selectedSong.id, songId)
        : onAddSongToMatchBySongId(divisionId, matchId, selectedSong.id);
      onClose();
    }
  };

  return (
    <OkModal
      open={open}
      onClose={onClose}
      title={songId ? "Edit song" : "Add song"}
      onOk={onSubmit}
    >
      <div className="w-full">
        <h3>Songs</h3>
        <div className="flex flex-row gap-3 mb-2">
          <div className="flex flex-row gap-1">
            <input
              type="radio"
              id="title"
              name="songAddType"
              value="title"
              checked={songAddType === "title"}
              onChange={() => setSongAddType("title")}
            />
            <label htmlFor="title">By title</label>
          </div>
          <div className="flex flex-row gap-1">
            <input
              type="radio"
              id="roll"
              name="songAddType"
              value="roll"
              checked={songAddType === "roll"}
              onChange={() => setSongAddType("roll")}
            />
            <label htmlFor="roll">By roll</label>
          </div>
        </div>
        {songAddType === "roll" && (
          <div>
            <div className="w-full py-2">
              <h3>Select song pack to roll</h3>
              <Select
                options={songGroups.map((g) => ({ value: g, label: g }))}
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
                menuPortalTarget={document.body}
                styles={selectPortalStyles}
              ></Select>
            </div>

            <h3 className="mt-2">Type song difficulty to roll</h3>

            <div>
              <input
                value={difficultyInput}
                onChange={(e) => setDifficultyInput(e.target.value)}
                className="border border-gray-300 px-2 py-2 mr-2 rounded-lg"
                type="number"
                placeholder="Type difficulty"
              />
            </div>
          </div>
        )}
        {songAddType === "title" && (
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="mb-2">Select pack</h3>
              <Select
                options={songGroups.map((g) => ({ value: g, label: g }))}
                placeholder="Select pack..."
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
                menuPortalTarget={document.body}
                styles={selectPortalStyles}
              />
            </div>

            <div>
              <h3 className="mb-2">Search song</h3>
              <input
                type="search"
                value={songSearch}
                onChange={(e) => setSongSearch(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                placeholder="Search by title or artist"
              />
            </div>

            <div>
              <h3 className="mb-2">Songs</h3>
              {filteredSongs.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-400 italic">
                  No songs match the current filters.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 bg-white">
                  {filteredSongs.map((song) => {
                    const isSelected = selectedSong?.id === song.id;
                    const label = song.artist ? `${song.artist} - ${song.title}` : song.title;

                    return (
                      <button
                        key={song.id}
                        type="button"
                        onClick={() => setSelectedSong(song)}
                        className={`w-full px-3 py-2.5 text-left transition-colors ${
                          isSelected ? "bg-primary-dark/10" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 shrink-0 text-center text-xs font-bold text-white bg-primary rounded">
                            {song.difficulty}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900">{label}</div>
                            <div className="text-xs text-gray-500">{song.group}</div>
                          </div>
                          {isSelected && (
                            <span className={`shrink-0 text-xs ${btnSecondary}`.replace("px-3 py-2", "px-2 py-1")}>
                              Selected
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </OkModal>
  );
}
