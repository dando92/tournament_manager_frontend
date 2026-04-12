import { useEffect, useMemo, useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Division } from "@/features/division/types/Division";
import { Participant } from "@/features/entrant/types/Entrant";
import {
  addParticipantToDivision,
  listAvailableParticipantsForDivision,
  removeParticipantFromDivision,
} from "@/features/participant/services/participant.api";
import { updateDivisionSeeding } from "@/features/player/services/player.api";

type Ordering = "name" | "seeding";

type UsePlayersTabOptions = {
  division: Division;
  onPlayersChanged: () => void;
};

export function usePlayersTab({ division, onPlayersChanged }: UsePlayersTabOptions) {
  const seededParticipantIds = useMemo(
    () =>
      [...(division.entrants ?? [])]
        .filter((entrant) => entrant.status === "active" && entrant.type === "player")
        .sort((a, b) => (a.seedNum ?? Number.MAX_SAFE_INTEGER) - (b.seedNum ?? Number.MAX_SAFE_INTEGER))
        .map((entrant) => entrant.participants?.[0]?.id)
        .filter((participantId): participantId is number => participantId !== undefined),
    [division.entrants],
  );
  const entrantIdByParticipantId = useMemo(
    () =>
      new Map(
        (division.entrants ?? [])
          .map((entrant) => {
            const participant = entrant.participants?.[0];
            return participant ? [participant.id, entrant.id] as const : null;
          })
          .filter((entry): entry is readonly [number, number] => Boolean(entry)),
      ),
    [division.entrants],
  );

  const [divisionParticipants, setDivisionParticipants] = useState<Participant[]>(
    (division.entrants ?? []).flatMap((entrant) => entrant.participants ?? []).filter(Boolean),
  );
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [localSeeding, setLocalSeeding] = useState<number[]>(seededParticipantIds);
  const [ordering, setOrdering] = useState<Ordering>("seeding");
  const [editingSeeding, setEditingSeeding] = useState(false);
  const [draftSeeding, setDraftSeeding] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [savingSeeding, setSavingSeeding] = useState(false);

  useEffect(() => {
    listAvailableParticipantsForDivision(division.id).then(setAvailableParticipants).catch(() => {});
  }, [division.id]);

  useEffect(() => {
    setDivisionParticipants((division.entrants ?? []).flatMap((entrant) => entrant.participants ?? []).filter(Boolean));
    setLocalSeeding(seededParticipantIds);
  }, [division.entrants, seededParticipantIds]);

  const divisionParticipantIds = useMemo(
    () => new Set(divisionParticipants.map((participant) => participant.id)),
    [divisionParticipants],
  );
  const activeSeeding = editingSeeding ? draftSeeding : localSeeding;
  const lowerSearch = search.toLowerCase();

  const filteredSeededDiv = useMemo(() => {
    const seeded = [...divisionParticipants].sort((a, b) => {
      const ai = activeSeeding.indexOf(a.id);
      const bi = activeSeeding.indexOf(b.id);
      return (ai === -1 ? divisionParticipants.length : ai) - (bi === -1 ? divisionParticipants.length : bi);
    });

    return seeded.filter((participant) => participant.player.playerName.toLowerCase().includes(lowerSearch));
  }, [activeSeeding, divisionParticipants, lowerSearch]);

  const filteredAvailableParticipants = useMemo(
    () =>
      availableParticipants
        .filter((participant) => participant.player.playerName.toLowerCase().includes(lowerSearch))
        .sort((a, b) => a.player.playerName.localeCompare(b.player.playerName)),
    [availableParticipants, lowerSearch],
  );

  const filteredAllAlpha = useMemo(
    () =>
      [...divisionParticipants]
        .filter((participant) => participant.player.playerName.toLowerCase().includes(lowerSearch))
        .sort((a, b) => a.player.playerName.localeCompare(b.player.playerName)),
    [divisionParticipants, lowerSearch],
  );

  const enterSeedingEdit = () => {
    setOrdering("seeding");
    setDraftSeeding([...localSeeding]);
    setEditingSeeding(true);
  };

  const exitSeedingEdit = async () => {
    setSavingSeeding(true);
    try {
      await updateDivisionSeeding(
        division.id,
        draftSeeding
          .map((participantId) => entrantIdByParticipantId.get(participantId))
          .filter((entrantId): entrantId is number => entrantId !== undefined),
      );
      setLocalSeeding(draftSeeding);
      onPlayersChanged();
    } finally {
      setSavingSeeding(false);
      setEditingSeeding(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const visibleIds = filteredSeededDiv.map((participant) => participant.id);
    const reordered = [...visibleIds];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const visibleSet = new Set(visibleIds);
    let visibleIndex = 0;
    setDraftSeeding(draftSeeding.map((id) => (visibleSet.has(id) ? reordered[visibleIndex++] : id)));
  };

  const handleAdd = async (participant: Participant) => {
    setDivisionParticipants((prev) => (prev.some((entry) => entry.id === participant.id) ? prev : [...prev, participant]));
    setAvailableParticipants((prev) => prev.filter((entry) => entry.id !== participant.id));
    setLocalSeeding((prev) => (prev.includes(participant.id) ? prev : [...prev, participant.id]));
    if (editingSeeding) {
      setDraftSeeding((prev) => (prev.includes(participant.id) ? prev : [...prev, participant.id]));
    }

    try {
      await addParticipantToDivision(division.id, participant.id);
      onPlayersChanged();
    } catch {
      setDivisionParticipants((prev) => prev.filter((entry) => entry.id !== participant.id));
      setAvailableParticipants((prev) => [...prev, participant].sort((a, b) => a.player.playerName.localeCompare(b.player.playerName)));
      setLocalSeeding((prev) => prev.filter((id) => id !== participant.id));
      if (editingSeeding) {
        setDraftSeeding((prev) => prev.filter((id) => id !== participant.id));
      }
    }
  };

  const handleRemove = async (participantId: number) => {
    const participant = divisionParticipants.find((entry) => entry.id === participantId);
    try {
      await removeParticipantFromDivision(division.id, participantId);
      setDivisionParticipants((prev) => prev.filter((participant) => participant.id !== participantId));
      if (participant) {
        setAvailableParticipants((prev) => [...prev, participant].sort((a, b) => a.player.playerName.localeCompare(b.player.playerName)));
      }
      setLocalSeeding((prev) => prev.filter((id) => id !== participantId));
      if (editingSeeding) {
        setDraftSeeding((prev) => prev.filter((id) => id !== participantId));
      }
      onPlayersChanged();
    } catch {
      // handled by axios interceptor
    }
  };

  const seedPos = (participantId: number) => {
    const index = localSeeding.indexOf(participantId);
    return index === -1 ? null : index + 1;
  };

  return {
    ordering,
    editingSeeding,
    search,
    showSelectModal,
    savingSeeding,
    divisionParticipantIds,
    draftSeeding,
    filteredSeededDiv,
    filteredAvailableParticipants,
    filteredAllAlpha,
    setOrdering,
    setSearch,
    setShowSelectModal,
    enterSeedingEdit,
    exitSeedingEdit,
    handleDragEnd,
    handleAdd,
    handleRemove,
    seedPos,
  };
}
