import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tournament } from "@/models/Tournament";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrophy, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useAuthContext } from "@/services/auth/AuthContext";
import { toast } from "react-toastify";

export default function TournamentSelectPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const canCreate = state.account?.isTournamentCreator || state.account?.isAdmin;
  const canDelete = state.account?.isAdmin;

  useEffect(() => {
    axios.get<Tournament[]>("tournaments")
      .then((response) => { setTournaments(response.data); setError(null); })
      .catch(() => setError("Failed to load tournaments."))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(e: React.MouseEvent, tournamentId: number) {
    e.stopPropagation();
    if (!confirm("Delete this tournament?")) return;
    try {
      await axios.delete(`tournaments/${tournamentId}`);
      setTournaments((prev) => prev.filter((t) => t.id !== tournamentId));
      toast.success("Tournament deleted.");
    } catch {
      toast.error("Failed to delete tournament.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-3xl text-rossoTesto font-bold">Select Tournament</h1>
        {canCreate && (
          <button
            onClick={() => navigate("/create-tournament")}
            className="bg-rossoTesto text-white px-4 py-2 rounded-lg flex flex-row items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            New Tournament
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && tournaments.length === 0 && (
        <p className="text-gray-500">No tournaments yet. {canCreate ? "Create one to get started." : ""}</p>
      )}

      <div className="flex flex-col gap-3">
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            onClick={() => navigate(`/manage/${tournament.id}`)}
            className="flex flex-row items-center gap-4 bg-gray-100 hover:bg-gray-200 cursor-pointer px-5 py-4 rounded-lg"
          >
            <FontAwesomeIcon icon={faTrophy} className="text-rossoTesto text-xl" />
            <span className="text-lg font-semibold">{tournament.name}</span>
            <span className="text-gray-400 text-sm ml-auto">#{tournament.id}</span>
            {canDelete && (
              <button
                onClick={(e) => handleDelete(e, tournament.id)}
                className="text-red-500 hover:text-red-700 px-2"
                title="Delete tournament"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
