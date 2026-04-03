import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBroadcastTower, faGear, faUsers } from "@fortawesome/free-solid-svg-icons";
import { btnPrimary } from "@/styles/buttonStyles";
import { useHelpers } from "@/shared/services/helpers/useHelpers";
import LobbiesModal from "@/features/admin/modals/LobbiesModal";
import ManageHelpersModal from "@/features/admin/modals/ManageHelpersModal";

type Props = {
  tournamentId: string;
  canEditHelpers: boolean;
};

export default function ManageActionsMenu({ tournamentId, canEditHelpers }: Props) {
  const [lobbiesOpen, setLobbiesOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { state: helpersState, actions: helpersActions } = useHelpers(Number(tournamentId));

  useEffect(() => {
    helpersActions.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  const availableCandidates = helpersState.candidates.filter(
    (c) => !helpersState.helpers.some((h) => h.id === c.id),
  );

  return (
    <>
      {/* Desktop: two buttons */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => setLobbiesOpen(true)}
          className={`flex items-center gap-2 ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faBroadcastTower} className="text-sm" />
          <span className="text-sm">Lobbies</span>
        </button>
        <button
          onClick={() => setParticipantsOpen(true)}
          className={`flex items-center gap-2 ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faUsers} className="text-sm" />
          <span className="text-sm">Helpers</span>
        </button>
      </div>

      {/* Mobile: gear button with dropdown */}
      <div className="relative md:hidden">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex items-center justify-center w-9 h-9 ${btnPrimary}`}
        >
          <FontAwesomeIcon icon={faGear} className="text-base" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[150px]">
              <button
                onClick={() => { setMenuOpen(false); setLobbiesOpen(true); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faBroadcastTower} className="text-primary-dark" />
                Lobbies
              </button>
              <button
                onClick={() => { setMenuOpen(false); setParticipantsOpen(true); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faUsers} className="text-primary-dark" />
                Helpers
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <LobbiesModal
        open={lobbiesOpen}
        tournamentId={tournamentId}
        onClose={() => setLobbiesOpen(false)}
      />
      <ManageHelpersModal
        open={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
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
