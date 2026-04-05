import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary } from "@/styles/buttonStyles";
import ManageHelpersModal from "@/features/admin/modals/ManageHelpersModal";
import { isLocalMode } from "@/features/auth/services/auth-mode";
import { useManageActionsMenu } from "@/shared/hooks/useManageActionsMenu";

type Props = {
  tournamentId: string;
  canEditHelpers: boolean;
};

export default function ManageActionsMenu({ tournamentId, canEditHelpers }: Props) {
  const localMode = isLocalMode();
  const {
    helpersOpen,
    helpersState,
    availableCandidates,
    helpersActions,
    setHelpersOpen,
    openHelpers,
  } = useManageActionsMenu(Number(tournamentId));

  if (localMode) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={openHelpers}
          className={`flex items-center gap-2 ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faUsers} className="text-sm" />
          <span className="text-sm">Helpers</span>
        </button>
      </div>

      <ManageHelpersModal
        open={helpersOpen}
        onClose={() => setHelpersOpen(false)}
        canEditHelpers={canEditHelpers}
        helpers={{
          helpers: helpersState.helpers,
          availableCandidates,
          onAdd: (id) => helpersActions.addHelper(id),
          onRemove: (id) => helpersActions.removeHelper(id),
        }}
      />
    </>
  );
}
