import CreateDivisionModal from "@/features/division/modals/CreateDivisionModal";
import GenerateBracketModal from "@/features/division/modals/GenerateBracketModal";
import ManageActionsMenu from "@/features/match/components/ManageActionsMenu";
import { TOURNAMENT_TABS, TournamentTabKey } from "@/features/tournament/config/tournamentTabs";
import { TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import SelectDivisionForBracketModal from "@/features/tournament/components/SelectDivisionForBracketModal";
import { TournamentPageState } from "@/features/tournament/hooks/useTournamentPage";
import { btnPrimary } from "@/styles/buttonStyles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faDiagramProject, faPlus } from "@fortawesome/free-solid-svg-icons";
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
  } = context;
  const {
    divisions,
    createDivisionOpen,
    selectDivisionOpen,
    generateBracketDivisionId,
    bracketTypes,
    createMenuOpen,
    setCreateDivisionOpen,
    setSelectDivisionOpen,
    setGenerateBracketDivisionId,
    setCreateMenuOpen,
    handleCreateDivision,
    handleGenerateBracket,
  } = state;

  const activeTab: TournamentTabKey =
    TOURNAMENT_TABS.find((tab) => location.pathname.endsWith(`/${tab.key}`))?.key ?? "overview";

  return (
    <div className="flex flex-col gap-4">
      <CreateDivisionModal
        open={createDivisionOpen}
        onClose={() => setCreateDivisionOpen(false)}
        onCreate={handleCreateDivision}
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

      <div className="flex items-end border-b border-gray-200 overflow-x-auto">
        {TOURNAMENT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(`/tournament/${tournamentId}/${tab.key}`)}
            className={`px-4 py-2 text-sm border-b-2 shrink-0 transition-colors ${
              activeTab === tab.key
                ? "border-primary-dark text-primary-dark font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Outlet context={context} />
    </div>
  );
}
