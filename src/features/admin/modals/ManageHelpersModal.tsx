import { useState } from "react";
import { Account } from "@/features/player/types/Account";
import BaseModal from "@/shared/components/ui/BaseModal";

type HelpersSection = {
  helpers: Account[];
  availableCandidates: Account[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  helpers: HelpersSection;
  canEditHelpers: boolean;
};

export default function ManageHelpersModal({
  open,
  onClose,
  helpers,
  canEditHelpers,
}: Props) {
  const [selectedHelperId, setSelectedHelperId] = useState("");

  return (
    <BaseModal open={open} onClose={onClose} title="Helpers" maxWidth="max-w-xl">
      <div className="flex flex-row gap-6">
        {/* Helpers section */}
        <div className="flex-1">
          <h4 className="font-semibold text-primary-dark mb-2">Tournament Helpers</h4>

          {canEditHelpers && helpers.availableCandidates.length > 0 && (
            <select
              className="border rounded px-2 py-1 text-sm w-full mb-2"
              value={selectedHelperId}
              onChange={(e) => {
                if (e.target.value) {
                  helpers.onAdd(e.target.value);
                  setSelectedHelperId("");
                } else {
                  setSelectedHelperId(e.target.value);
                }
              }}
            >
              <option value="" disabled>
                Add helper...
              </option>
              {helpers.availableCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.username}
                </option>
              ))}
            </select>
          )}

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {helpers.helpers.length === 0 && (
              <p className="text-sm text-gray-500">No helpers assigned yet.</p>
            )}
            {helpers.helpers.map((h) => (
              <div
                key={h.id}
                className="flex flex-row items-center justify-between bg-gray-50 px-3 py-2 rounded"
              >
                <span className="text-sm font-medium">{h.username}</span>
                {canEditHelpers && (
                  <button
                    onClick={() => helpers.onRemove(h.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
