import BaseModal from "@/shared/components/ui/BaseModal";
import { Participant } from "@/features/entrant/types/Entrant";
import { btnPrimary, btnSecondary } from "@/styles/buttonStyles";

type Props = {
  open: boolean;
  participants: Participant[];
  onClose: () => void;
  onAdd: (participant: Participant) => Promise<void>;
};

export default function SelectParticipantsModal({ open, participants, onClose, onAdd }: Props) {
  return (
    <BaseModal open={open} onClose={onClose} title="Select participants" maxWidth="max-w-md">
      <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
        {participants.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No tournament participants available.</p>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm">
              <span>{participant.player.playerName}</span>
              <button
                type="button"
                onClick={() => onAdd(participant).then(onClose)}
                className={`${btnPrimary} px-3 py-1 text-xs`}
              >
                Add
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" onClick={onClose} className={`${btnSecondary} text-sm`}>Close</button>
      </div>
    </BaseModal>
  );
}
