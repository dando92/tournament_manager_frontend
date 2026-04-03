import { Navigate, useParams } from "react-router-dom";
import { usePermissions } from "@/shared/services/permissions/PermissionContext";
import TournamentLayout from "@/features/tournament/layout/TournamentLayout";
import { TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import { useTournamentPage } from "@/features/tournament/hooks/useTournamentPage";
import { getSelectedTournament } from "@/features/tournament/services/recentTournaments";

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

  return <TournamentPageContainer tournamentId={selectedTournamentId} />;
}

function TournamentPageContainer({ tournamentId }: { tournamentId: number }) {
  const { canEditTournament, canEditHelpers } = usePermissions();
  const canControl = canEditTournament(tournamentId);
  const canHelpers = canEditHelpers(tournamentId);
  const state = useTournamentPage({ tournamentId, canControl });

  const context: TournamentPageContextValue = {
    tournamentId,
    tournamentName: state.tournamentName,
    divisions: state.divisions,
    controls: canControl,
    helpersEnabled: canHelpers,
    initialActiveLobbies: state.initialActiveLobbies,
    refreshDivisions: state.refreshDivisions,
    openCreateDivision: () => state.setCreateDivisionOpen(true),
    openGenerateBracketPicker: () => state.setSelectDivisionOpen(true),
  };

  return <TournamentLayout context={context} state={state} />;
}
