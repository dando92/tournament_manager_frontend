import { useEffect, useState } from "react";
import axios from "axios";
import SongsList from "@/components/manage/songs/SongsList";
import { useAuthContext } from "@/services/auth/AuthContext";
import { usePageTitle } from "@/services/PageTitleContext";
import { Tournament } from "@/models/Tournament";
import TournamentSelector from "@/components/TournamentSelector";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SongsPage() {
  const { state: authState } = useAuthContext();
  const [isHelper, setIsHelper] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const account = authState.account;
    if (account && !account.isAdmin && !account.isTournamentCreator) {
      axios
        .get<{ isHelper: boolean }>("tournaments/is-helper")
        .then((r) => setIsHelper(r.data.isHelper))
        .catch(() => {});
    }
  }, [authState.account]);

  useEffect(() => {
    setIsLoading(true);
    axios.get<Tournament[]>("tournaments/public")
      .then((r) => { setTournaments(r.data); setError(null); })
      .catch(() => setError("Failed to load tournaments."))
      .finally(() => setIsLoading(false));
  }, []);

  const canEdit =
    !!authState.account &&
    (authState.account.isAdmin || authState.account.isTournamentCreator || isHelper);

  const { setPageTitle } = usePageTitle();
  useEffect(() => {
    setPageTitle(selectedTournament?.name ?? null);
    return () => setPageTitle(null);
  }, [selectedTournament?.name]);

  if (!selectedTournament) {
    return (
      <TournamentSelector
        tournaments={tournaments}
        onSelect={setSelectedTournament}
        loading={isLoading}
        error={error}
      />
    );
  }

  return (
    <div>
      <button
        onClick={() => setSelectedTournament(null)}
        className="flex items-center gap-2 text-rossoTesto hover:underline mb-4 text-sm"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back to tournament list
      </button>
      <SongsList canEdit={canEdit} tournamentId={selectedTournament.id} />
    </div>
  );
}
