import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Player } from "@/features/player/types/Player";
import { Song } from "@/features/song/types/Song";
import { CreateMatchRequest } from "@/features/match/types/match-requests";
import { Division } from "@/features/division/types/Division";
import { Phase } from "@/features/division/types/Phase";

type UseCreateMatchModalOptions = {
  open: boolean;
  onClose: () => void;
  onCreate: (request: CreateMatchRequest) => void;
  phaseId?: number;
  phases?: Phase[];
  divisionId?: number;
  divisions?: Division[];
  tournamentId?: number;
};

export function useCreateMatchModal({
  open,
  onClose,
  onCreate,
  phaseId,
  phases,
  divisionId,
  divisions,
  tournamentId,
}: UseCreateMatchModalOptions) {
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(
    divisionId ?? divisions?.[0]?.id ?? null,
  );
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scoringSystems, setScoringSystems] = useState<string[]>([]);
  const [scoringSystem, setScoringSystem] = useState("");
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [songAddType, setSongAddType] = useState<"title" | "roll">("roll");
  const [selectedSongDifficulties, setSelectedSongDifficulties] = useState<string[]>([]);
  const [difficultyInput, setDifficultyInput] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [songGroups, setSongGroups] = useState<string[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);

  const availablePhases = useMemo(
    () =>
      divisionId
        ? phases ?? []
        : divisions?.find((division) => division.id === selectedDivisionId)?.phases ?? [],
    [divisionId, divisions, phases, selectedDivisionId],
  );

  const resolvedPhaseId = phaseId ?? selectedPhaseId;
  const resolvedDivisionId = divisionId ?? selectedDivisionId;

  useEffect(() => {
    if (!open) return;

    const initialDivisionId = divisionId ?? divisions?.[0]?.id ?? null;
    const initialPhases = divisionId
      ? phases ?? []
      : divisions?.find((division) => division.id === initialDivisionId)?.phases ?? [];

    setSelectedDivisionId(initialDivisionId);
    setSelectedPhaseId(phaseId ?? initialPhases[0]?.id ?? null);
    setSelectedPlayers([]);
    setSelectedSongs([]);
    setSelectedSongDifficulties([]);
    setDifficultyInput("");
    setSongAddType("roll");
  }, [divisionId, divisions, open, phaseId, phases]);

  useEffect(() => {
    if (!open || divisionId || phaseId) return;
    const nextPhases = divisions?.find((division) => division.id === selectedDivisionId)?.phases ?? [];
    setSelectedPhaseId(nextPhases[0]?.id ?? null);
  }, [divisionId, divisions, open, phaseId, selectedDivisionId]);

  useEffect(() => {
    if (!open || !resolvedDivisionId) return;
    axios.get<Player[]>(`divisions/${resolvedDivisionId}/players`).then((response) => {
      setPlayers(response.data);
    });
  }, [open, resolvedDivisionId]);

  useEffect(() => {
    if (!open) return;
    axios
      .get<Song[]>(tournamentId ? `songs?tournamentId=${tournamentId}` : "songs")
      .then((response) => {
        setSongs(response.data);
        setSongGroups([...new Set(response.data.map((song) => song.group))]);
        setSelectedGroupName(response.data[0]?.group ?? "");
      });
  }, [open, tournamentId]);

  useEffect(() => {
    if (!open) return;
    axios.get<string[]>("matches/scoring-systems").then((response) => {
      setScoringSystems(response.data);
      setScoringSystem(response.data[0] ?? "");
    });
  }, [open]);

  const addDifficulty = () => {
    if (!difficultyInput) return;
    setSelectedSongDifficulties((prev) => [...prev, difficultyInput]);
    setDifficultyInput("");
  };

  const removeDifficulty = (index: number) => {
    setSelectedSongDifficulties((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = () => {
    if (!resolvedPhaseId || !resolvedDivisionId) return;

    const baseRequest = {
      phaseId: resolvedPhaseId,
      divisionId: resolvedDivisionId,
      name,
      subtitle,
      group: selectedGroupName,
      scoringSystem,
      playerIds: selectedPlayers.map((player) => player.id),
    };

    const request: CreateMatchRequest =
      songAddType === "title"
        ? {
            ...baseRequest,
            songIds: selectedSongs.map((song) => song.id),
          } as CreateMatchRequest
        : {
            ...baseRequest,
            levels: selectedSongDifficulties.join(","),
          } as CreateMatchRequest;

    onCreate(request);
    onClose();
  };

  return {
    players,
    songs,
    songGroups,
    scoringSystems,
    selectedDivisionId,
    selectedPhaseId,
    selectedPlayers,
    selectedSongs,
    selectedSongDifficulties,
    selectedGroupName,
    difficultyInput,
    scoringSystem,
    name,
    subtitle,
    songAddType,
    availablePhases,
    setSelectedDivisionId,
    setSelectedPhaseId,
    setSelectedPlayers,
    setSelectedSongs,
    setSelectedGroupName,
    setDifficultyInput,
    setScoringSystem,
    setName,
    setSubtitle,
    setSongAddType,
    addDifficulty,
    removeDifficulty,
    handleSubmit,
  };
}
