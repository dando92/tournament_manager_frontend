import { Division } from "@/features/division/types/Division";
import PlayersByNameList from "@/features/division/components/PlayersByNameList";
import PlayersSearchBar from "@/features/division/components/PlayersSearchBar";
import PlayersSeedingList from "@/features/division/components/PlayersSeedingList";
import PlayersTabHeader from "@/features/division/components/PlayersTabHeader";
import PlayersWarning from "@/features/division/components/PlayersWarning";
import PhaseSelector from "@/features/division/components/PhaseSelector";
import { usePlayersTab } from "@/features/division/hooks/usePlayersTab";
import SelectParticipantsModal from "./SelectParticipantsModal";

type Props = {
  division: Division;
  canEdit: boolean;
  onPlayersChanged: () => void;
};

export default function PlayersTab({ division, canEdit, onPlayersChanged }: Props) {
  const state = usePlayersTab({ division, onPlayersChanged });

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <SelectParticipantsModal
        open={state.showSelectModal}
        participants={state.filteredAvailableParticipants}
        onAdd={state.handleAdd}
        onClose={() => state.setShowSelectModal(false)}
      />

      <PlayersTabHeader
        canEdit={canEdit}
        selectedPhase={state.selectedPhase}
        ordering={state.ordering}
        editingSeeding={state.editingSeeding}
        savingSeeding={state.savingSeeding}
        onOrderingChange={state.setOrdering}
        onEditSeeding={state.enterSeedingEdit}
        onDoneSeeding={state.exitSeedingEdit}
        onSelectParticipants={() => state.setShowSelectModal(true)}
      />

      <PhaseSelector
        phases={state.phases}
        selectedPhaseId={state.selectedPhaseId ?? "all"}
        onSelect={(phaseId) => state.setSelectedPhaseId(phaseId === "all" ? state.phases[0]?.id ?? null : phaseId)}
        summaryLabel="First phase"
        summarySublabel="Select a phase to manage entrant seeding"
      />

      <PlayersSearchBar value={state.search} onChange={state.setSearch} />
      <PlayersWarning warnings={[]} />

      {state.selectedPhase === null && (
        <p className="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
          Create a phase before setting seeding for entrants.
        </p>
      )}

      {state.selectedPhase !== null && state.ordering === "name" ? (
        <PlayersByNameList
          players={state.filteredAllAlpha}
          canEdit={canEdit}
          divisionParticipantIds={state.divisionParticipantIds}
          seedPos={state.seedPos}
          onRemove={state.handleRemove}
          totalParticipants={state.filteredAllAlpha.length}
        />
      ) : state.selectedPhase !== null ? (
        <PlayersSeedingList
          canEdit={canEdit}
          editingSeeding={state.editingSeeding}
          draftSeeding={state.draftSeeding}
          seededPlayers={state.filteredSeededDiv}
          seedPos={state.seedPos}
          onDragEnd={state.handleDragEnd}
          onRemove={state.handleRemove}
        />
      ) : null}
    </div>
  );
}
