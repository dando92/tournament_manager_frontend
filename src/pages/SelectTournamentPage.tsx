import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tournament } from "@/models/Tournament";
import { addRecentTournament } from "@/services/recentTournaments";
import TournamentSelector from "@/components/TournamentSelector";
import CreateTournamentModal from "@/components/modals/CreateTournamentModal";
import { useAuthContext } from "@/services/auth/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary } from "@/styles/buttonStyles";

export default function SelectTournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { state } = useAuthContext();
  const canCreate = state.account?.isTournamentCreator || state.account?.isAdmin;

  useEffect(() => {
    axios
      .get<Tournament[]>("tournaments/public")
      .then((r) => {
        setTournaments(r.data);
        setError(null);
      })
      .catch(() => setError("Failed to load tournaments."))
      .finally(() => setIsLoading(false));
  }, []);

  function handleSelect(t: Tournament) {
    addRecentTournament({ id: t.id, name: t.name });
    navigate(`/view/${t.id}`);
  }

  return (
    <>
      <CreateTournamentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(t) => {
          addRecentTournament({ id: t.id, name: t.name });
          navigate(`/manage/${t.id}`);
        }}
      />
      <TournamentSelector
        tournaments={tournaments}
        onSelect={handleSelect}
        loading={isLoading}
        error={error}
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
      />
    </>
  );
}
