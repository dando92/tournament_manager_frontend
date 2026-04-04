import CreateDivisionModal from "@/features/division/modals/CreateDivisionModal";
import CreatePhaseModal from "@/features/division/modals/CreatePhaseModal";
import GenerateBracketModal from "@/features/division/modals/GenerateBracketModal";
import ManageActionsMenu from "@/features/match/components/ManageActionsMenu";
import CreateMatchModal from "@/features/match/modals/CreateMatchModal";
import { TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import SelectDivisionForBracketModal from "@/features/tournament/components/SelectDivisionForBracketModal";
import { TournamentPageState } from "@/features/tournament/hooks/useTournamentPage";
import { btnPrimary } from "@/styles/buttonStyles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faDiagramProject, faDice, faLayerGroup, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Outlet, useNavigate } from "react-router-dom";

type TournamentLayoutProps = {
  context: TournamentPageContextValue;
  state: TournamentPageState;
};

export default function TournamentLayout({ context, state }: TournamentLayoutProps) {
  const navigate = useNavigate();
  const {
    tournamentId,
    tournamentName,
    controls,
    helpersEnabled,
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
          <p className="text-sm text-gray-500">Tournament workspace</p>
        </div>

        {controls && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCreateMenuOpen((value) => !value)}
                className={`flex items-center gap-2 ${btnPrimary}`}
              >
                Create
                <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
              </button>
              {createMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCreateMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[180px]">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateMenuOpen(false);
                        setCreateDivisionOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-primary-dark" />
                      New division
                    </button>
                    <button
                      type="button"
                      disabled={divisions.length === 0}
                      onClick={() => {
                        setCreateMenuOpen(false);
                        setSelectDivisionOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faDiagramProject} className="text-primary-dark" />
                      Generate bracket
                    </button>
                    <button
                      type="button"
                      disabled={divisions.length === 0}
                      onClick={() => {
                        setCreateMenuOpen(false);
                        setCreatePhaseOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faLayerGroup} className="text-primary-dark" />
                      Phase
                    </button>
                    <button
                      type="button"
                      disabled={!divisions.some((division) => (division.phases?.length ?? 0) > 0)}
                      onClick={() => {
                        setCreateMenuOpen(false);
                        setCreateMatchOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faDice} className="text-primary-dark" />
                      Match
                    </button>
                  </div>
                </>
              )}
            </div>
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
