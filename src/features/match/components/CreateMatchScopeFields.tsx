import Select from "react-select";
import { selectPortalStyles } from "@/styles/selectStyles";
import { MatchPhaseOption } from "@/features/match/types/MatchPhaseOption";
import { TournamentDivisionOption } from "@/features/tournament/types/TournamentDivisionOption";

type CreateMatchScopeFieldsProps = {
  divisionId?: number;
  phaseId?: number;
  divisions?: TournamentDivisionOption[];
  phases?: MatchPhaseOption[];
  availablePhases: MatchPhaseOption[];
  selectedDivisionId: number | null;
  selectedPhaseId: number | null;
  onDivisionChange: (divisionId: number | null) => void;
  onPhaseChange: (phaseId: number | null) => void;
};

export default function CreateMatchScopeFields({
  divisionId,
  phaseId,
  divisions,
  phases,
  availablePhases,
  selectedDivisionId,
  selectedPhaseId,
  onDivisionChange,
  onPhaseChange,
}: CreateMatchScopeFieldsProps) {
  return (
    <>
      {!divisionId && divisions && divisions.length > 0 && (
        <div className="w-full">
          <h3>Division</h3>
          <Select
            options={divisions.map((division) => ({ value: division.id, label: division.name }))}
            value={
              selectedDivisionId
                ? {
                    value: selectedDivisionId,
                    label: divisions.find((division) => division.id === selectedDivisionId)?.name ?? "",
                  }
                : null
            }
            onChange={(selected) => onDivisionChange(selected?.value ?? null)}
            menuPortalTarget={document.body}
            styles={selectPortalStyles}
          />
        </div>
      )}
      {!phaseId && phases && phases.length > 0 && (
        <div className="w-full">
          <h3>Phase</h3>
          <Select
            options={phases.map((phase) => ({ value: phase.id, label: phase.name }))}
            value={
              selectedPhaseId
                ? { value: selectedPhaseId, label: phases.find((phase) => phase.id === selectedPhaseId)?.name ?? "" }
                : null
            }
            onChange={(selected) => onPhaseChange(selected?.value ?? null)}
            menuPortalTarget={document.body}
            styles={selectPortalStyles}
          />
        </div>
      )}
      {!phaseId && !divisionId && availablePhases.length > 0 && (
        <div className="w-full">
          <h3>Phase</h3>
          <Select
            options={availablePhases.map((phase) => ({ value: phase.id, label: phase.name }))}
            value={
              selectedPhaseId
                ? {
                    value: selectedPhaseId,
                    label: availablePhases.find((phase) => phase.id === selectedPhaseId)?.name ?? "",
                  }
                : null
            }
            onChange={(selected) => onPhaseChange(selected?.value ?? null)}
            menuPortalTarget={document.body}
            styles={selectPortalStyles}
          />
        </div>
      )}
    </>
  );
}
