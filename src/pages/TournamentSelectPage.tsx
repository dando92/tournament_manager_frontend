import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { btnPrimary } from "@/utils/buttonStyles";
import axios from "axios";
import { Tournament } from "@/models/Tournament";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useAuthContext } from "@/services/auth/AuthContext";
import { toast } from "react-toastify";
import TournamentSelector from "@/components/TournamentSelector";
import CreateTournamentModal from "@/components/modals/CreateTournamentModal";

export default function TournamentSelectPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const canCreate = state.account?.isTournamentCreator || state.account?.isAdmin;
  const canDelete = state.account?.isAdmin;

  useEffect(() => {
    axios.get<Tournament[]>("tournaments")
      .then((r) => { setTournaments(r.data); setError(null); })
      .catch(() => setError("Failed to load tournaments."))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(tournamentId: number) {
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
    <>
      <CreateTournamentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(t) => navigate(`/manage/${t.id}`)}
      />
      <TournamentSelector
        tournaments={tournaments}
        onSelect={(t) => navigate(`/manage/${t.id}`)}
        loading={loading}
        error={error}
        showId
        headerAction={
          canCreate ? (
            <button
              onClick={() => setCreateModalOpen(true)}
              className={`${btnPrimary} flex items-center gap-2 text-sm font-semibold`}
            >
              <FontAwesomeIcon icon={faPlus} />
              New Tournament
            </button>
          ) : undefined
        }
        extraRowAction={
          canDelete
            ? (t) => (
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-red-500 hover:text-red-700 px-1"
                  title="Delete tournament"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )
            : undefined
        }
      />
    </>
  );
}
