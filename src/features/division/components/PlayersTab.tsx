import { Division } from "@/features/division/types/Division";
import PlayersByNameList from "@/features/division/components/PlayersByNameList";
import PlayersSearchBar from "@/features/division/components/PlayersSearchBar";
import PlayersSeedingList from "@/features/division/components/PlayersSeedingList";
import PlayersTabHeader from "@/features/division/components/PlayersTabHeader";
import PlayersWarning from "@/features/division/components/PlayersWarning";
import { usePlayersTab } from "@/features/division/hooks/usePlayersTab";
import BulkImportModal from "./BulkImportModal";

type Props = {
  division: Division;
  canEdit: boolean;
  onPlayersChanged: () => void;
};

export default function PlayersTab({ division, canEdit, onPlayersChanged }: Props) {
  const state = usePlayersTab({ division, onPlayersChanged });

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <BulkImportModal
        open={state.showBulkModal}
        onImport={state.handleBulkImport}
        onClose={() => state.setShowBulkModal(false)}
      />

      <PlayersTabHeader
        canEdit={canEdit}
        ordering={state.ordering}
        editingSeeding={state.editingSeeding}
        savingSeeding={state.savingSeeding}
        onOrderingChange={state.setOrdering}
        onEditSeeding={state.enterSeedingEdit}
        onDoneSeeding={state.exitSeedingEdit}
        onBulkImport={() => state.setShowBulkModal(true)}
      />

      <PlayersSearchBar value={state.search} onChange={state.setSearch} />
      <PlayersWarning warnings={state.warnings} />

      {state.ordering === "name" ? (
        <PlayersByNameList
          players={state.filteredAllAlpha}
          canEdit={canEdit}
          divPlayerIds={state.divPlayerIds}
          seedPos={state.seedPos}
          onAdd={state.handleAdd}
          onRemove={state.handleRemove}
          totalPlayers={state.allPlayers.length}
        />
      ) : (
        <PlayersSeedingList
          canEdit={canEdit}
          editingSeeding={state.editingSeeding}
          draftSeeding={state.draftSeeding}
          seededPlayers={state.filteredSeededDiv}
          nonDivisionPlayers={state.filteredNonDiv}
          seedPos={state.seedPos}
          onDragEnd={state.handleDragEnd}
          onAdd={state.handleAdd}
          onRemove={state.handleRemove}
        />
      )}
    </div>
  );
}
