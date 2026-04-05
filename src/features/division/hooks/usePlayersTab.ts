import { useEffect, useMemo, useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Division } from "@/features/division/types/Division";
import { Player } from "@/features/player/types/Player";
import {
  assignPlayerToDivision,
  bulkAddToDivision,
  getAllPlayers,
  removeFromDivision,
  updateDivisionSeeding,
} from "@/features/player/services/player.api";

type Ordering = "name" | "seeding";

type UsePlayersTabOptions = {
  division: Division;
  onPlayersChanged: () => void;
};

export function usePlayersTab({ division, onPlayersChanged }: UsePlayersTabOptions) {
  const [divPlayers, setDivPlayers] = useState<Player[]>(division.players ?? []);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [localSeeding, setLocalSeeding] = useState<number[]>(division.seeding ?? []);
  const [ordering, setOrdering] = useState<Ordering>("seeding");
  const [editingSeeding, setEditingSeeding] = useState(false);
  const [draftSeeding, setDraftSeeding] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [savingSeeding, setSavingSeeding] = useState(false);

  useEffect(() => {
    getAllPlayers().then(setAllPlayers).catch(() => {});
  }, []);

  useEffect(() => {
    setDivPlayers(division.players ?? []);
    setLocalSeeding(division.seeding ?? []);
  }, [division.players, division.seeding]);

  const divPlayerIds = useMemo(() => new Set(divPlayers.map((player) => player.id)), [divPlayers]);
  const activeSeeding = editingSeeding ? draftSeeding : localSeeding;
  const lowerSearch = search.toLowerCase();

  const filteredSeededDiv = useMemo(() => {
    const seeded = [...divPlayers].sort((a, b) => {
      const ai = activeSeeding.indexOf(a.id);
      const bi = activeSeeding.indexOf(b.id);
      return (ai === -1 ? divPlayers.length : ai) - (bi === -1 ? divPlayers.length : bi);
    });

    return seeded.filter((player) => player.playerName.toLowerCase().includes(lowerSearch));
  }, [activeSeeding, divPlayers, lowerSearch]);

  const filteredNonDiv = useMemo(
    () =>
      allPlayers
        .filter((player) => !divPlayerIds.has(player.id))
        .filter((player) => player.playerName.toLowerCase().includes(lowerSearch))
        .sort((a, b) => a.playerName.localeCompare(b.playerName)),
    [allPlayers, divPlayerIds, lowerSearch],
  );

  const filteredAllAlpha = useMemo(
    () =>
      [...allPlayers]
        .filter((player) => player.playerName.toLowerCase().includes(lowerSearch))
        .sort((a, b) => a.playerName.localeCompare(b.playerName)),
    [allPlayers, lowerSearch],
  );

  const enterSeedingEdit = () => {
    setOrdering("seeding");
    setDraftSeeding([...localSeeding]);
    setEditingSeeding(true);
  };

  const exitSeedingEdit = async () => {
    setSavingSeeding(true);
    try {
      await updateDivisionSeeding(division.id, draftSeeding);
      setLocalSeeding(draftSeeding);
      onPlayersChanged();
    } finally {
      setSavingSeeding(false);
      setEditingSeeding(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const visibleIds = filteredSeededDiv.map((player) => player.id);
    const reordered = [...visibleIds];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const visibleSet = new Set(visibleIds);
    let visibleIndex = 0;
    setDraftSeeding(draftSeeding.map((id) => (visibleSet.has(id) ? reordered[visibleIndex++] : id)));
  };

  const handleAdd = async (player: Player) => {
    setDivPlayers((prev) => (prev.some((entry) => entry.id === player.id) ? prev : [...prev, player]));
    setLocalSeeding((prev) => (prev.includes(player.id) ? prev : [...prev, player.id]));
    if (editingSeeding) {
      setDraftSeeding((prev) => (prev.includes(player.id) ? prev : [...prev, player.id]));
    }

    try {
      await assignPlayerToDivision(player.id, division.id);
      setWarnings([]);
      onPlayersChanged();
    } catch {
      setDivPlayers((prev) => prev.filter((entry) => entry.id !== player.id));
      setLocalSeeding((prev) => prev.filter((id) => id !== player.id));
      if (editingSeeding) {
        setDraftSeeding((prev) => prev.filter((id) => id !== player.id));
      }
    }
  };

  const handleRemove = async (playerId: number) => {
    try {
      await removeFromDivision(playerId, division.id);
      setDivPlayers((prev) => prev.filter((player) => player.id !== playerId));
      setLocalSeeding((prev) => prev.filter((id) => id !== playerId));
      if (editingSeeding) {
        setDraftSeeding((prev) => prev.filter((id) => id !== playerId));
      }
      setWarnings([]);
      onPlayersChanged();
    } catch {
      // handled by axios interceptor
    }
  };

  const handleBulkImport = async (names: string[]) => {
    if (names.length === 0) return;
    const result = await bulkAddToDivision(division.id, names);
    setDivPlayers((prev) => {
      const existingIds = new Set(prev.map((player) => player.id));
      return [...prev, ...result.players.filter((player) => !existingIds.has(player.id))];
    });

    const appendSeeding = (prev: number[]) => {
      const existing = new Set(prev);
      return [
        ...prev,
        ...result.players.filter((player) => !existing.has(player.id)).map((player) => player.id),
      ];
    };

    setLocalSeeding(appendSeeding);
    if (editingSeeding) {
      setDraftSeeding(appendSeeding);
    }
    setWarnings(result.warnings);
    onPlayersChanged();
  };

  const seedPos = (playerId: number) => {
    const index = localSeeding.indexOf(playerId);
    return index === -1 ? null : index + 1;
  };

  return {
    allPlayers,
    ordering,
    editingSeeding,
    search,
    warnings,
    showBulkModal,
    savingSeeding,
    divPlayerIds,
    draftSeeding,
    filteredSeededDiv,
    filteredNonDiv,
    filteredAllAlpha,
    setOrdering,
    setSearch,
    setShowBulkModal,
    enterSeedingEdit,
    exitSeedingEdit,
    handleDragEnd,
    handleAdd,
    handleRemove,
    handleBulkImport,
    seedPos,
  };
}
