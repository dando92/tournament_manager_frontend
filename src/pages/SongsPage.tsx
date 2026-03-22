import { useEffect } from "react";
import axios from "axios";
import SongsList from "@/components/manage/songs/SongsList";
import { usePageTitle } from "@/services/PageTitleContext";
import { Navigate, useParams } from "react-router-dom";
import { getSelectedTournament } from "@/services/recentTournaments";
import { usePermissions } from "@/services/permissions/PermissionContext";

export default function SongsPage() {
  const { tournamentId: tidParam } = useParams<{ tournamentId?: string }>();
  const { setPageTitle } = usePageTitle();
  const { canEditTournament } = usePermissions();

  const tournamentId = tidParam ? Number(tidParam) : getSelectedTournament()?.id ?? null;

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

  return <SongsList canEdit={canEditTournament(tournamentId)} tournamentId={tournamentId} />;
}
