import { useState, useEffect } from "react";
import OkModal from "@/shared/components/ui/OkModal";

type CreatePhaseModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export default function CreatePhaseModal({ open, onClose, onCreate }: CreatePhaseModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
  }, [open]);

  const onSubmit = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    onClose();
  };

  return (
    <OkModal
      title="Create Phase"
      okText="Create phase"
      open={open}
      onClose={onClose}
      onOk={onSubmit}
    >
      <div className="flex flex-col gap-4 w-full">
        <div>
          <h3 className="mb-1">Name</h3>
          <input
            className="w-full border border-gray-300 px-2 py-2 rounded-lg"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Phase name"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          />
        </div>
      </div>
    </OkModal>
  );
}
