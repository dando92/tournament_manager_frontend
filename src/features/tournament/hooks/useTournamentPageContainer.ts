import { useState } from "react";
import { usePermissions } from "@/shared/services/permissions/PermissionContext";
import { ParticipantsManageModal, TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import { useTournamentPage } from "@/features/tournament/hooks/useTournamentPage";

export function useTournamentPageContainer(tournamentId: number) {
  const { canEditTournament } = usePermissions();
  const canControl = canEditTournament(tournamentId);
  const state = useTournamentPage({ tournamentId, canControl });
  const [songsVersion, setSongsVersion] = useState(0);
  const [participantsManageModal, setParticipantsManageModal] = useState<ParticipantsManageModal>("none");

  const context: TournamentPageContextValue = {
    tournamentId,
    tournamentName: state.tournamentName,
    syncstartUrl: state.syncstartUrl,
    songsVersion,
    divisions: state.divisions,
    controls: canControl,
    setSyncstartUrl: state.setSyncstartUrl,
    refreshDivisions: state.refreshDivisions,
    refreshSongs: () => setSongsVersion((value) => value + 1),
    openCreateDivision: () => state.setCreateDivisionOpen(true),
    openCreatePhase: () => state.setCreatePhaseOpen(true),
    openCreateMatch: () => state.setCreateMatchOpen(true),
    openGenerateBracketPicker: () => state.setSelectDivisionOpen(true),
    participantsManageModal,
    setParticipantsManageModal,
  };

  return {
    context,
    state,
  };
}
