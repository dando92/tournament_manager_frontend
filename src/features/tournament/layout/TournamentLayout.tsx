import TournamentManagementModals from "@/features/tournament/components/TournamentManagementModals";
import TournamentPageHeader from "@/features/tournament/components/header/TournamentPageHeader";
import { TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import { TournamentPageState } from "@/features/tournament/hooks/useTournamentPage";
import { useTournamentLayout } from "@/features/tournament/hooks/useTournamentLayout";
import { Outlet } from "react-router-dom";

type TournamentLayoutProps = {
  context: TournamentPageContextValue;
  state: TournamentPageState;
};

export default function TournamentLayout({ context, state }: TournamentLayoutProps) {
  const { isOverviewPage, isLobbiesPage, isSongsPage, headerSubtitle, handleCreatePhase, handleCreateMatch, handleGenerateBracket } =
    useTournamentLayout({ context, state });

  return (
    <div className="flex flex-col gap-4">
      <TournamentManagementModals
        context={context}
        state={state}
        onCreatePhase={handleCreatePhase}
        onCreateMatch={handleCreateMatch}
        onGenerateBracket={handleGenerateBracket}
      />

      <TournamentPageHeader
        tournamentId={context.tournamentId}
        tournamentName={context.tournamentName}
        headerSubtitle={headerSubtitle}
        controls={context.controls}
        helpersEnabled={context.helpersEnabled}
        isOverviewPage={isOverviewPage}
        isSongsPage={isSongsPage}
        isLobbiesPage={isLobbiesPage}
        syncstartUrl={context.syncstartUrl}
        setSyncstartUrl={context.setSyncstartUrl}
        songsVersion={context.songsVersion}
        refreshSongs={context.refreshSongs}
        createMenuOpen={state.createMenuOpen}
        setCreateMenuOpen={state.setCreateMenuOpen}
        hasDivisions={state.divisions.length > 0}
        hasPhases={state.divisions.some((division) => (division.phases?.length ?? 0) > 0)}
        onCreateDivision={() => state.setCreateDivisionOpen(true)}
        onGenerateBracket={() => state.setSelectDivisionOpen(true)}
        onCreatePhase={() => state.setCreatePhaseOpen(true)}
        onCreateMatch={() => state.setCreateMatchOpen(true)}
      />

      <Outlet context={context} />
    </div>
  );
}
