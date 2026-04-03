import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Division } from "@/features/division/types/Division";
import { useTournamentUpdates } from "@/features/tournament/context/TournamentUpdatesContext";

type UseDivisionPageResult = {
  division: Division | null;
  refreshDivision: () => Promise<void>;
};

export function useDivisionPage(tournamentId: number, divisionId: number): UseDivisionPageResult {
  const location = useLocation();
  const { divisionDetailVersions, matchListVersions } = useTournamentUpdates();
  const [division, setDivision] = useState<Division | null>(null);
  const divisionDetailVersion = divisionDetailVersions.get(divisionId) ?? 0;
  const matchListVersion = matchListVersions.get(divisionId) ?? 0;

  const refreshDivision = useCallback(async () => {
    const response = await axios.get<Division>(`divisions/${divisionId}`);
    setDivision(response.data);
  }, [divisionId]);

  useEffect(() => {
    refreshDivision().catch(() => {});
  }, [location.search, refreshDivision]);

  useEffect(() => {
    if (divisionDetailVersion === 0 && matchListVersion === 0) return;
    refreshDivision().catch(() => {});
  }, [divisionDetailVersion, matchListVersion, refreshDivision, tournamentId]);

  return {
    division,
    refreshDivision,
  };
}
