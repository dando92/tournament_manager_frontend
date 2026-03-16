import { useEffect, useState } from "react";
import axios from "axios";
import SongsList from "@/components/manage/songs/SongsList";
import { useAuthContext } from "@/services/auth/AuthContext";
import { usePageTitle } from "@/services/PageTitleContext";
import { Navigate, useParams } from "react-router-dom";
import { getSelectedTournament } from "@/services/recentTournaments";

export default function SongsPage() {
  const { tournamentId: tidParam } = useParams<{ tournamentId?: string }>();
  const { state: authState } = useAuthContext();
  const [isHelper, setIsHelper] = useState(false);
  const { setPageTitle } = usePageTitle();

  const tournamentId = tidParam ? Number(tidParam) : getSelectedTournament()?.id ?? null;

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
    if (!tournamentId) { setPageTitle(null); return; }
    axios
      .get<{ name: string }>(`tournaments/${tournamentId}`)
      .then((r) => setPageTitle(r.data.name))
      .catch(() => setPageTitle(null));
    return () => setPageTitle(null);
  }, [tournamentId]);

  if (!tournamentId) {
    return <Navigate to="/select" replace />;
  }

  if (!tidParam) {
    return <Navigate to={`/songs/${tournamentId}`} replace />;
  }

  const canEdit =
    !!authState.account &&
    (authState.account.isAdmin || authState.account.isTournamentCreator || isHelper);

  return <SongsList canEdit={canEdit} tournamentId={tournamentId} />;
}
