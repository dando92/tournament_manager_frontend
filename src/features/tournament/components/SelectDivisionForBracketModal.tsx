import { Division } from "@/features/division/types/Division";
import BaseModal from "@/shared/components/ui/BaseModal";

type Props = {
  open: boolean;
  divisions: Division[];
  onClose: () => void;
  onSelect: (divisionId: number) => void;
};

export default function SelectDivisionForBracketModal({
  open,
  divisions,
  onClose,
  onSelect,
}: Props) {
  return (
    <BaseModal open={open} onClose={onClose} title="Select Division" maxWidth="max-w-lg">
      <div className="flex flex-col gap-3">
        {divisions.length === 0 ? (
          <p className="text-sm text-gray-400">No divisions available.</p>
        ) : (
          divisions.map((division) => {
            const playerCount = division.players?.length ?? 0;
            const disabled = playerCount === 0;

            return (
              <button
                key={division.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(division.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                  disabled
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-primary-dark hover:bg-primary-dark/5"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm">{division.name}</div>
                    <div className="text-xs text-gray-500">
                      {playerCount} player{playerCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className="text-xs font-medium">
                    {disabled ? "No players" : "Generate"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </BaseModal>
  );
}
