import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Division } from "@/features/division/types/Division";
import { useMatchHub } from "@/features/live/services/useMatchHub";

type UseDivisionPageResult = {
  division: Division | null;
  updatedMatchIds: ReadonlySet<number>;
  refreshDivision: () => Promise<void>;
};

export function useDivisionPage(tournamentId: number, divisionId: number): UseDivisionPageResult {
  const [division, setDivision] = useState<Division | null>(null);
  const [updatedMatchIds, setUpdatedMatchIds] = useState<ReadonlySet<number>>(new Set());
  const pendingUpdates = useRef<Set<number>>(new Set());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshDivision = useCallback(async () => {
    const response = await axios.get<Division>(`divisions/${divisionId}`);
    setDivision(response.data);
  }, [divisionId]);

  useEffect(() => {
    refreshDivision().catch(() => {});
  }, [refreshDivision]);

  const handleMatchHubUpdate = useCallback((data: { matchId: number; phaseId: number }) => {
    const phaseIds = new Set((division?.phases ?? []).map((phase) => phase.id));
    if (!phaseIds.has(data.phaseId)) return;
    pendingUpdates.current.add(data.matchId);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const flush = new Set(pendingUpdates.current);
      pendingUpdates.current = new Set();
      setUpdatedMatchIds(flush);
    }, 50);
  }, [division]);

  useMatchHub(handleMatchHubUpdate, tournamentId);

  return {
    division,
    updatedMatchIds,
    refreshDivision,
  };
}
