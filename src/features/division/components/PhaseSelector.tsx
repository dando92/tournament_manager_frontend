import { Phase } from "@/features/division/types/Phase";

type PhaseSelectorProps = {
  phases: Phase[];
  selectedPhaseId: number | "all";
  onSelect: (phaseId: number | "all") => void;
  summaryLabel?: string;
  summarySublabel?: string;
};

export default function PhaseSelector({
  phases,
  selectedPhaseId,
  onSelect,
  summaryLabel = "Summary",
  summarySublabel = "All phases",
}: PhaseSelectorProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-2 pb-1">
        <PhaseButton
          label={summaryLabel}
          sublabel={summarySublabel}
          selected={selectedPhaseId === "all"}
          onClick={() => onSelect("all")}
        />
        {phases.map((phase) => {
          const matchCount = phase.matchCount ?? phase.phaseGroups.reduce((count, phaseGroup) => count + phaseGroup.matchCount, 0);
          const groupCount = phase.phaseGroups.length;

          return (
            <PhaseButton
              key={phase.id}
              label={phase.name}
              sublabel={`${phase.type} • ${groupCount} group${groupCount !== 1 ? "s" : ""} • ${matchCount} match${matchCount !== 1 ? "es" : ""}`}
              selected={selectedPhaseId === phase.id}
              onClick={() => onSelect(phase.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

type PhaseButtonProps = {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
};

function PhaseButton({ label, sublabel, selected, onClick }: PhaseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-40 flex-col items-start rounded border px-3 py-1.5 text-left text-xs transition-colors ${
        selected
          ? "border-primary-dark bg-primary-dark/10 text-primary-dark"
          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <span className={`font-medium ${selected ? "text-primary-dark" : "text-gray-700"}`}>{label}</span>
      {sublabel && <span className="text-gray-400">{sublabel}</span>}
    </button>
  );
}
