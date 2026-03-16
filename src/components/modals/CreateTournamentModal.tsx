import { useState } from "react";
import axios from "axios";
import { Tournament } from "@/models/Tournament";
import BaseModal from "@/components/modals/BaseModal";
import { btnPrimary } from "@/styles/buttonStyles";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (tournament: Tournament) => void;
};

export default function CreateTournamentModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleClose = () => {
    setName("");
    setApiError(null);
    onClose();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setApiError(null);
    setLoading(true);
    try {
      const response = await axios.post<Tournament>("tournaments", { name: trimmed });
      setName("");
      onCreated(response.data);
    } catch {
      setApiError("Failed to create tournament.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="New Tournament"
      maxWidth="max-w-md"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 border border-rossoTesto text-rossoTesto py-2 rounded font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-tournament-form"
            disabled={loading || !name.trim()}
            className={`flex-1 ${btnPrimary} font-semibold`}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      }
    >
      <form id="create-tournament-form" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium mb-1">Tournament Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="e.g. Euro Cup 2026"
          autoFocus
          required
        />
        {apiError && <p className="text-red-500 text-sm mt-2">{apiError}</p>}
      </form>
    </BaseModal>
  );
}
