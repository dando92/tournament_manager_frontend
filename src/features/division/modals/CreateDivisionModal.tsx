import { useState, useEffect } from "react";
import OkModal from "@/shared/components/ui/OkModal";

type CreateDivisionModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, playersPerMatch: number | null) => void;
};

export default function CreateDivisionModal({
  open,
  onClose,
  onCreate,
}: CreateDivisionModalProps) {
  const [name, setName] = useState("");
  const [playersPerMatch, setPlayersPerMatch] = useState("2");

  useEffect(() => {
    if (!open) return;
    setName("");
    setPlayersPerMatch("2");
  }, [open]);

  const onSubmit = () => {
    const parsedPlayersPerMatch = Number(playersPerMatch);
    if (!name.trim() || !Number.isFinite(parsedPlayersPerMatch) || parsedPlayersPerMatch < 1) return;
    onCreate(name.trim(), parsedPlayersPerMatch);
    onClose();
  };

  return (
    <OkModal
      title="Create Division"
      okText="Create division"
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
            placeholder="Division name"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          />
        </div>
        <div>
          <h3 className="mb-1">Players per match</h3>
          <input
            className="w-full border border-gray-300 px-2 py-2 rounded-lg"
            type="number"
            min={1}
            value={playersPerMatch}
            onChange={(e) => setPlayersPerMatch(e.target.value)}
            placeholder="Players per match"
            onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          />
        </div>
      </div>
    </OkModal>
  );
}
