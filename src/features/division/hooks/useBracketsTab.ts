import { useState } from "react";
import axios from "axios";
import { Division } from "@/features/division/types/Division";

type UseBracketsTabOptions = {
  division: Division;
  onDivisionChanged?: () => Promise<void>;
};

export function useBracketsTab({ division, onDivisionChanged }: UseBracketsTabOptions) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | "all">("all");
  const phases = division.phases ?? [];
  const selectedPhase =
    selectedPhaseId !== "all" ? phases.find((phase) => phase.id === selectedPhaseId) ?? null : null;

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
