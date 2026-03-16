import { useEffect, useState } from "react";
import OkModal from "@/components/modals/OkModal";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export default function CreatePhaseModal({ open, onClose, onCreate }: Props) {
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
    <OkModal title="Create Phase" okText="Create" open={open} onClose={onClose} onOk={onSubmit}>
      <input
        className="w-full border border-gray-300 px-2 py-2 rounded-lg mt-2"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="Phase name"
        autoFocus
      />
    </OkModal>
  );
}
