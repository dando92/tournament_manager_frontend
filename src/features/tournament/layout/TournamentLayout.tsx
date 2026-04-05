import CreateDivisionModal from "@/features/division/modals/CreateDivisionModal";
import CreatePhaseModal from "@/features/division/modals/CreatePhaseModal";
import GenerateBracketModal from "@/features/division/modals/GenerateBracketModal";
import ManageActionsMenu from "@/features/match/components/ManageActionsMenu";
import CreateMatchModal from "@/features/match/modals/CreateMatchModal";
import TournamentHeaderCreateMenu from "@/features/tournament/components/header/TournamentHeaderCreateMenu";
import TournamentHeaderLobbyManageMenu from "@/features/tournament/components/header/TournamentHeaderLobbyManageMenu";
import TournamentHeaderSongsManageMenu from "@/features/tournament/components/header/TournamentHeaderSongsManageMenu";
import { getTournamentHeaderSubtitle } from "@/features/tournament/components/header/tournamentHeaderSubtitle";
import { TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import SelectDivisionForBracketModal from "@/features/tournament/components/SelectDivisionForBracketModal";
import { TournamentPageState } from "@/features/tournament/hooks/useTournamentPage";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

type TournamentLayoutProps = {
  context: TournamentPageContextValue;
  state: TournamentPageState;
};

export default function TournamentLayout({ context, state }: TournamentLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tournamentId,
    tournamentName,
    controls,
    helpersEnabled,
    syncstartUrl,
    setSyncstartUrl,
    songsVersion,
    refreshSongs,
  } = context;
  const {
    divisions,
    createDivisionOpen,
    selectDivisionOpen,
    createPhaseOpen,
    createMatchOpen,
    generateBracketDivisionId,
    bracketTypes,
    createMenuOpen,
    setCreateDivisionOpen,
    setSelectDivisionOpen,
    setCreatePhaseOpen,
    setCreateMatchOpen,
    setGenerateBracketDivisionId,
    setCreateMenuOpen,
    handleCreateDivision,
    handleCreatePhase,
    handleCreateMatch,
    handleGenerateBracket,
  } = state;

  const isOverviewPage = location.pathname === `/tournament/${tournamentId}/overview`;
  const isLobbiesPage = location.pathname === `/tournament/${tournamentId}/lobbies`;
  const isSongsPage = location.pathname === `/tournament/${tournamentId}/songs`;
  const headerSubtitle = getTournamentHeaderSubtitle(location.pathname, tournamentId);

  return (
    <div className="flex flex-col gap-4">
      <CreateDivisionModal
        open={createDivisionOpen}
        onClose={() => setCreateDivisionOpen(false)}
        onCreate={handleCreateDivision}
      />
      <CreatePhaseModal
        open={createPhaseOpen}
        onClose={() => setCreatePhaseOpen(false)}
        divisions={divisions.map((division) => ({ id: division.id, name: division.name }))}
        onCreate={async (name, divisionId) => {
          await handleCreatePhase(name, divisionId);
          navigate(`/tournament/${tournamentId}/division/${divisionId}/phases?refresh=${Date.now()}`);
        }}
      />
      <CreateMatchModal
        open={createMatchOpen}
        onClose={() => setCreateMatchOpen(false)}
        onCreate={async (request) => {
          await handleCreateMatch(request);
          if (request.divisionId) {
            navigate(`/tournament/${tournamentId}/division/${request.divisionId}/phases?refresh=${Date.now()}`);
          }
        }}
        divisions={divisions}
        tournamentId={tournamentId}
      />
      <SelectDivisionForBracketModal
        open={selectDivisionOpen}
        divisions={divisions}
        onClose={() => setSelectDivisionOpen(false)}
        onSelect={(divisionId) => {
          setSelectDivisionOpen(false);
          setGenerateBracketDivisionId(divisionId);
        }}
      />
      <GenerateBracketModal
        open={generateBracketDivisionId !== null}
        onClose={() => setGenerateBracketDivisionId(null)}
        bracketTypes={bracketTypes}
        onGenerate={async (bracketType, playerPerMatch) => {
          await handleGenerateBracket(bracketType, playerPerMatch);
          if (generateBracketDivisionId) {
            navigate(`/tournament/${tournamentId}/division/${generateBracketDivisionId}/phases`);
          }
        }}
      />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-gray-900">{tournamentName}</h1>
          <p className="text-sm text-gray-500">{headerSubtitle}</p>
        </div>

        {controls && (
          <div className="flex items-center gap-2 ml-auto">
            {isOverviewPage && (
              <TournamentHeaderCreateMenu
                open={createMenuOpen}
                setOpen={setCreateMenuOpen}
                hasDivisions={divisions.length > 0}
                hasPhases={divisions.some((division) => (division.phases?.length ?? 0) > 0)}
                onCreateDivision={() => setCreateDivisionOpen(true)}
                onGenerateBracket={() => setSelectDivisionOpen(true)}
                onCreatePhase={() => setCreatePhaseOpen(true)}
                onCreateMatch={() => setCreateMatchOpen(true)}
              />
            )}
            {isSongsPage && (
              <TournamentHeaderSongsManageMenu
                tournamentId={tournamentId}
                songsVersion={songsVersion}
                refreshSongs={refreshSongs}
              />
            )}
            {isLobbiesPage && (
              <TournamentHeaderLobbyManageMenu
                tournamentId={tournamentId}
                syncstartUrl={syncstartUrl}
                setSyncstartUrl={setSyncstartUrl}
              />
            )}
            <ManageActionsMenu
              tournamentId={String(tournamentId)}
              canEditHelpers={helpersEnabled}
            />
          </div>
        )}
      </div>

      <Outlet context={context} />
    </div>
  );
}
