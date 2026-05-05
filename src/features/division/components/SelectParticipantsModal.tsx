import { useEffect, useMemo, useState } from "react";
import BaseModal from "@/shared/components/ui/BaseModal";
import { Participant } from "@/features/entrant/types/Entrant";
import MultiSelect, { MultiSelectOption } from "@/shared/components/ui/MultiSelect";
import { btnPrimary, btnSecondary } from "@/styles/buttonStyles";

type Props = {
  open: boolean;
  participants: Participant[];
  onClose: () => void;
  onAdd: (participant: Participant) => Promise<void>;
};

export default function SelectParticipantsModal({ open, participants, onClose, onAdd }: Props) {
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>([]);
  const [saving, setSaving] = useState(false);

  const participantOptions = useMemo(
    () =>
      participants.map((participant) => ({
        value: participant.id,
        label: participant.player.playerName,
      })),
    [participants],
  );

  useEffect(() => {
    if (open) {
      setSelectedOptions([]);
      setSaving(false);
    }
  }, [open]);

  const handleAddSelected = async () => {
    setSaving(true);
    try {
      const selectedParticipants = selectedOptions
        .map((option) => participants.find((participant) => participant.id === option.value))
        .filter((participant): participant is Participant => Boolean(participant));

      for (const participant of selectedParticipants) {
        await onAdd(participant);
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} title="Select participants" maxWidth="max-w-md">
      <div className="flex flex-col gap-3">
        {participants.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No tournament participants available.</p>
        ) : (
          <MultiSelect
            options={participantOptions}
            value={selectedOptions}
            onChange={setSelectedOptions}
            placeholder="Select participants..."
          />
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={`${btnSecondary} text-sm`}>
          Close
        </button>
        <button
          type="button"
          onClick={handleAddSelected}
          disabled={selectedOptions.length === 0 || saving}
          className={`${btnPrimary} text-sm disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {saving ? "Adding..." : "Add selected"}
        </button>
      </div>
    </BaseModal>
  );
}
