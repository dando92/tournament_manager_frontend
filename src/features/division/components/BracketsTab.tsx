import MatchList from "@/features/match/components/MatchList";
import PhaseMatchesPanel from "@/features/division/components/PhaseMatchesPanel";
import PhaseSelector from "@/features/division/components/PhaseSelector";
import { Division } from "@/features/division/types/Division";
import { useBracketsTab } from "@/features/division/hooks/useBracketsTab";

type BracketsTabProps = {
  division: Division;
  controls: boolean;
  tournamentId?: number;
  matchRefreshKey?: number;
  onDivisionChanged?: () => Promise<void>;
};

export default function BracketsTab({
  division,
  controls,
  tournamentId,
  matchRefreshKey,
  onDivisionChanged,
}: BracketsTabProps) {
  const state = useBracketsTab({ division, onDivisionChanged });

  return (
    <div className="flex flex-col gap-4">
      <PhaseSelector
        phases={state.phases}
        selectedPhaseId={state.selectedPhaseId}
        onSelect={state.setSelectedPhaseId}
      />

      {state.selectedPhaseId === "active" ? (
        <MatchList
          division={division}
          controls={controls}
          tournamentId={tournamentId}
          matchUpdateSignal={matchRefreshKey}
          activeOnly
        />
      ) : state.selectedPhaseId === "all" ? (
        state.phases.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No bracket yet.</p>
        ) : (
          <MatchList
            division={division}
            controls={controls}
            tournamentId={tournamentId}
            matchUpdateSignal={matchRefreshKey}
          />
        )
      ) : state.selectedPhase ? (
        <PhaseMatchesPanel
          phase={state.selectedPhase}
          division={division}
          controls={controls}
          tournamentId={tournamentId}
          matchRefreshKey={matchRefreshKey}
          onDelete={state.handleDeletePhase}
        />
      ) : (
        <MatchList
          division={division}
          controls={controls}
          tournamentId={tournamentId}
          matchUpdateSignal={matchRefreshKey}
        />
      )}
    </div>
  );
}
