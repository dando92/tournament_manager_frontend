import { useState } from "react";
import { usePermissions } from "@/shared/services/permissions/PermissionContext";
import { TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import { useTournamentPage } from "@/features/tournament/hooks/useTournamentPage";

export function useTournamentPageContainer(tournamentId: number) {
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

  return {
    context,
    state,
  };
}
