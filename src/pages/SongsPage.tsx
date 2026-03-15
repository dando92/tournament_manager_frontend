import { useEffect, useState } from "react";
import axios from "axios";
import SongsList from "../components/manage/songs/SongsList";
import { useAuthContext } from "../services/auth/AuthContext";
import { Tournament } from "../models/Tournament";
import Select from "react-select";

export default function SongsPage() {
  const { state: authState } = useAuthContext();
  const [isHelper, setIsHelper] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
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

  if (isLoading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="text-white">
      <div className="mb-4">
        <label className="block text-sm mb-1 text-rossoTesto">Tournament</label>
        <Select
          options={tournaments.map((t) => ({ value: t.id, label: t.name }))}
          placeholder="Select tournament..."
          className="w-[300px]"
          isClearable
          value={
            selectedTournamentId != null
              ? { value: selectedTournamentId, label: tournaments.find((t) => t.id === selectedTournamentId)?.name ?? "" }
              : null
          }
          onChange={(selected) =>
            setSelectedTournamentId(selected ? selected.value : null)
          }
        />
      </div>
      <SongsList canEdit={canEdit} tournamentId={selectedTournamentId ?? undefined} />
    </div>
  );
}
