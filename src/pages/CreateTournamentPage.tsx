import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tournament } from "../models/Tournament";

export default function CreateTournamentPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post<Tournament>("tournaments", { name });
      navigate(`/manage/${response.data.id}`);
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
            disabled={loading}
            className="flex-1 bg-rossoTesto text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
