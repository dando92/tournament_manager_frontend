import { Navigate, useParams } from "react-router-dom";
import { usePermissions } from "@/shared/services/permissions/PermissionContext";
import TournamentLayout from "@/features/tournament/layout/TournamentLayout";
import { TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import { TournamentUpdatesProvider } from "@/features/tournament/context/TournamentUpdatesContext";
import { useTournamentPage } from "@/features/tournament/hooks/useTournamentPage";
import { getSelectedTournament } from "@/features/tournament/services/recentTournaments";
import { useState } from "react";

export default function TournamentPage() {
  const { tournamentId: tidParam } = useParams<{ tournamentId?: string }>();
  const selectedTournamentId = tidParam ? Number(tidParam) : null;

  if (selectedTournamentId === null) {
    const last = getSelectedTournament();
    if (last) {
      return <Navigate to={`/tournament/${last.id}/overview`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <TournamentUpdatesProvider tournamentId={selectedTournamentId}>
      <TournamentPageContainer tournamentId={selectedTournamentId} />
    </TournamentUpdatesProvider>
  );
}

function TournamentPageContainer({ tournamentId }: { tournamentId: number }) {
  const { canEditTournament, canEditHelpers } = usePermissions();
  const canControl = canEditTournament(tournamentId);
  const canHelpers = canEditHelpers(tournamentId);
  const state = useTournamentPage({ tournamentId, canControl });
  const [songsVersion, setSongsVersion] = useState(0);

  const context: TournamentPageContextValue = {
    tournamentId,
    tournamentName: state.tournamentName,
    syncstartUrl: state.syncstartUrl,
    songsVersion,
    divisions: state.divisions,
    controls: canControl,
    helpersEnabled: canHelpers,
    setSyncstartUrl: state.setSyncstartUrl,
    refreshDivisions: state.refreshDivisions,
    refreshSongs: () => setSongsVersion((value) => value + 1),
    openCreateDivision: () => state.setCreateDivisionOpen(true),
    openCreatePhase: () => state.setCreatePhaseOpen(true),
    openCreateMatch: () => state.setCreateMatchOpen(true),
    openGenerateBracketPicker: () => state.setSelectDivisionOpen(true),
  };

  return <TournamentLayout context={context} state={state} />;
}
