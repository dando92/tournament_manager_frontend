import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Song } from "@/features/song/types/Song";

type UseAddEditSongToMatchModalOptions = {
  open: boolean;
  tournamentId?: number;
};

export function useAddEditSongToMatchModal({
  open,
  tournamentId,
}: UseAddEditSongToMatchModalOptions) {
  const [songAddType, setSongAddType] = useState<"title" | "roll">("roll");
  const [difficultyInput, setDifficultyInput] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [songGroups, setSongGroups] = useState<string[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songSearch, setSongSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    const url = tournamentId ? `songs?tournamentId=${tournamentId}` : "songs";
    axios.get<Song[]>(url).then((response) => {
      setSongs(response.data);
      setSongGroups([...new Set(response.data.map((song) => song.group))]);
      setSelectedGroupName(response.data[0]?.group ?? "");
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
    [selectedGroupName, songSearch, songs],
  );

  useEffect(() => {
    if (selectedSong && !filteredSongs.some((song) => song.id === selectedSong.id)) {
      setSelectedSong(null);
    }
  }, [filteredSongs, selectedSong]);

  return {
    songAddType,
    difficultyInput,
    songs,
    songGroups,
    selectedGroupName,
    selectedSong,
    songSearch,
    filteredSongs,
    setSongAddType,
    setDifficultyInput,
    setSelectedGroupName,
    setSelectedSong,
    setSongSearch,
  };
}
