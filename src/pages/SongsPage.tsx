import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import SongsList from "@/components/manage/songs/SongsList";
import { useAuthContext } from "@/services/auth/AuthContext";
import { usePageTitle } from "@/services/PageTitleContext";
import { Navigate, useLocation } from "react-router-dom";
import { getSelectedTournament } from "@/services/recentTournaments";

export default function SongsPage() {
  const { state: authState } = useAuthContext();
  const [isHelper, setIsHelper] = useState(false);
  const { setPageTitle } = usePageTitle();
  const location = useLocation();

  const selected = useMemo(() => getSelectedTournament(), [location.key]);

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
    setPageTitle(selected?.name ?? null);
    return () => setPageTitle(null);
  }, [selected?.name]);

  if (!selected) {
    return <Navigate to="/select" replace />;
  }

  const canEdit =
    !!authState.account &&
    (authState.account.isAdmin || authState.account.isTournamentCreator || isHelper);

  return <SongsList canEdit={canEdit} tournamentId={selected.id} />;
}
