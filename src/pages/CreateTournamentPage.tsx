import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tournament } from "@/models/Tournament";
import { btnPrimary } from "@/utils/buttonStyles";

export default function CreateTournamentPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setApiError(null);
    setLoading(true);
    try {
      const response = await axios.post<Tournament>("tournaments", { name: trimmed });
      navigate(`/manage/${response.data.id}`);
    } catch {
      setApiError("Failed to create tournament.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-3xl font-bold text-rossoTesto mb-6">New Tournament</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tournament Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Euro Cup 2026"
            required
          />
        </div>
        {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/manage")}
            className="flex-1 border border-rossoTesto text-rossoTesto py-2 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className={`flex-1 ${btnPrimary} font-semibold`}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
