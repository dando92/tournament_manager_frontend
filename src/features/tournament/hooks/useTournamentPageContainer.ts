import { useState } from "react";
import { useMatch } from "react-router-dom";
import { usePermissions } from "@/shared/services/permissions/PermissionContext";
import { ParticipantsManageModal, TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import { useTournamentPage } from "@/features/tournament/hooks/useTournamentPage";

export function useTournamentPageContainer(tournamentId: number) {
  const divisionMatch = useMatch("/tournament/:tournamentId/division/:divisionId/*");
  const phaseMatch = useMatch("/tournament/:tournamentId/division/:divisionId/phases/:phaseId");
  const { canEditTournament } = usePermissions();
  const canControl = canEditTournament(tournamentId);
  const state = useTournamentPage({ tournamentId, canControl });
  const [songsVersion, setSongsVersion] = useState(0);
  const [participantsManageModal, setParticipantsManageModal] = useState<ParticipantsManageModal>("none");
  const parsedDivisionId = divisionMatch?.params.divisionId ? Number(divisionMatch.params.divisionId) : undefined;
  const parsedPhaseId = phaseMatch?.params.phaseId ? Number(phaseMatch.params.phaseId) : 0;
  const currentDivisionId = parsedDivisionId && Number.isFinite(parsedDivisionId) ? parsedDivisionId : undefined;
  const currentPhaseId = Number.isFinite(parsedPhaseId) ? parsedPhaseId : 0;

  const context: TournamentPageContextValue = {
    tournamentId,
    tournamentName: state.tournamentName,
    currentDivisionId,
    currentPhaseId,
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
