import CreateDivisionModal from "@/features/division/modals/CreateDivisionModal";
import CreatePhaseModal from "@/features/division/modals/CreatePhaseModal";
import GenerateBracketModal from "@/features/division/modals/GenerateBracketModal";
import CreateMatchModal from "@/features/match/modals/CreateMatchModal";
import SelectDivisionForBracketModal from "@/features/tournament/components/SelectDivisionForBracketModal";
import StartggImportModal from "@/features/tournament/modals/StartggImportModal";
import { TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import { TournamentPageState } from "@/features/tournament/hooks/useTournamentPage";
import { CreateMatchRequest } from "@/features/match/types/match-requests";

type TournamentManagementModalsProps = {
  context: TournamentPageContextValue;
  state: TournamentPageState;
  onCreatePhase: (name: string, divisionId: number, type: "pool" | "bracket") => Promise<void>;
  onCreateMatch: (request: CreateMatchRequest) => Promise<void>;
  onGenerateBracket: (bracketType: string, playerPerMatch: number) => Promise<void>;
};

export default function TournamentManagementModals({
  context,
  state,
  onCreatePhase,
  onCreateMatch,
  onGenerateBracket,
}: TournamentManagementModalsProps) {
  return (
    <>
      <CreateDivisionModal
        open={state.createDivisionOpen}
        onClose={() => state.setCreateDivisionOpen(false)}
        onCreate={state.handleCreateDivision}
      />
      <CreatePhaseModal
        open={state.createPhaseOpen}
        onClose={() => state.setCreatePhaseOpen(false)}
        divisions={state.divisions.map((division) => ({ id: division.id, name: division.name }))}
        onCreate={onCreatePhase}
      />
      <CreateMatchModal
        open={state.createMatchOpen}
        onClose={() => state.setCreateMatchOpen(false)}
        onCreate={onCreateMatch}
        divisions={state.divisions}
        tournamentId={context.tournamentId}
      />
      <SelectDivisionForBracketModal
        open={state.selectDivisionOpen}
        divisions={state.divisions}
        onClose={() => state.setSelectDivisionOpen(false)}
        onSelect={(divisionId) => {
          state.setSelectDivisionOpen(false);
          state.setGenerateBracketDivisionId(divisionId);
        }}
      />
      <GenerateBracketModal
        open={state.generateBracketDivisionId !== null}
        onClose={() => state.setGenerateBracketDivisionId(null)}
        bracketTypes={state.bracketTypes}
        onGenerate={onGenerateBracket}
      />
      <StartggImportModal
        open={context.participantsManageModal === "startgg"}
        onClose={() => context.setParticipantsManageModal("none")}
        fixedTournamentId={context.tournamentId}
        fixedTournamentName={context.tournamentName}
        onImported={async () => {
          await context.refreshDivisions();
        }}
      />
    </>
  );
}
