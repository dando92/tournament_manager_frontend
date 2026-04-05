import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faUsers } from "@fortawesome/free-solid-svg-icons";
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
    menuOpen,
    helpersState,
    availableCandidates,
    helpersActions,
    setHelpersOpen,
    setMenuOpen,
    openHelpers,
  } = useManageActionsMenu(Number(tournamentId));

  if (localMode) {
    return null;
  }

  return (
    <>
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={openHelpers}
          className={`flex items-center gap-2 ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faUsers} className="text-sm" />
          <span className="text-sm">Helpers</span>
        </button>
      </div>

      <div className="relative md:hidden">
        <button
          onClick={() => setMenuOpen((value) => !value)}
          className={`flex items-center justify-center w-9 h-9 ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faGear} className="text-base" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[150px]">
              <button
                onClick={openHelpers}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faUsers} className="text-primary-dark" />
                Helpers
              </button>
            </div>
          </>
        )}
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
