import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortAmountDown, faUsers } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary, btnSecondary } from "@/styles/buttonStyles";

type Ordering = "name" | "seeding";

type PlayersTabHeaderProps = {
  canEdit: boolean;
  selectedPhase: { id: number; name: string; type: "pool" | "bracket" } | null;
  ordering: Ordering;
  editingSeeding: boolean;
  savingSeeding: boolean;
  onOrderingChange: (ordering: Ordering) => void;
  onEditSeeding: () => void;
  onDoneSeeding: () => void;
  onSelectParticipants: () => void;
};

export default function PlayersTabHeader({
  canEdit,
  selectedPhase,
  ordering,
  editingSeeding,
  savingSeeding,
  onOrderingChange,
  onEditSeeding,
  onDoneSeeding,
  onSelectParticipants,
}: PlayersTabHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h2 className="text-primary-dark font-bold text-xl">Entrants</h2>
        <p className="text-sm text-gray-500">
          {selectedPhase ? `Seeding for ${selectedPhase.name}` : "Select a phase to manage seeding"}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`flex border border-gray-200 rounded overflow-hidden text-sm ${editingSeeding ? "opacity-40 pointer-events-none" : ""}`}>
          <button
            onClick={() => onOrderingChange("name")}
            className={`px-3 py-1.5 transition-colors ${
              ordering === "name" ? "bg-primary-dark text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            By name
          </button>
          <button
            onClick={() => onOrderingChange("seeding")}
            className={`px-3 py-1.5 transition-colors border-l border-gray-200 ${
              ordering === "seeding" ? "bg-primary-dark text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            By seeding
          </button>
        </div>

        {canEdit && (
          editingSeeding ? (
            <button
              onClick={onDoneSeeding}
              disabled={savingSeeding}
              className={`${btnPrimary} flex items-center gap-1.5 text-sm`}
            >
              {savingSeeding ? "Saving..." : "Done"}
            </button>
          ) : (
            <button
              onClick={onEditSeeding}
              className={`${btnSecondary} flex items-center gap-1.5 text-sm`}
            >
              <FontAwesomeIcon icon={faSortAmountDown} />
              <span className="hidden sm:inline">Edit seeding</span>
            </button>
          )
        )}

        {canEdit && (
          <button
            onClick={onSelectParticipants}
            className={`${btnPrimary} flex items-center gap-1.5 text-sm`}
          >
            <FontAwesomeIcon icon={faUsers} />
            <span className="hidden sm:inline">Select participants</span>
          </button>
        )}
      </div>
    </div>
  );
}
