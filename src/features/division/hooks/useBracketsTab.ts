import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Division } from "@/features/division/types/Division";

type UseBracketsTabOptions = {
  division: Division;
  onDivisionChanged?: () => Promise<void>;
};

export function useBracketsTab({ division, onDivisionChanged }: UseBracketsTabOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const routePhaseId = Number(searchParams.get("phaseId") ?? "0");
  const phases = useMemo(() => division.phases ?? [], [division.phases]);
  const [selectedPhaseId, setSelectedPhaseIdState] = useState<number | "all">(
    routePhaseId > 0 && phases.some((phase) => phase.id === routePhaseId) ? routePhaseId : "all",
  );
  const selectedPhase =
    selectedPhaseId !== "all" ? phases.find((phase) => phase.id === selectedPhaseId) ?? null : null;

  useEffect(() => {
    setSelectedPhaseIdState(
      routePhaseId > 0 && phases.some((phase) => phase.id === routePhaseId) ? routePhaseId : "all",
    );
  }, [phases, routePhaseId]);

  const setSelectedPhaseId = (phaseId: number | "all") => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("phaseId", phaseId === "all" ? "0" : String(phaseId));
    setSearchParams(nextParams);
    setSelectedPhaseIdState(phaseId);
  };

  const handleDeletePhase = async (phaseId: number) => {
    await axios.delete(`phases/${phaseId}`);
    setSelectedPhaseId("all");
    await onDivisionChanged?.();
  };

  return {
    phases,
    selectedPhaseId,
    selectedPhase,
    setSelectedPhaseId,
    handleDeletePhase,
  };
}
