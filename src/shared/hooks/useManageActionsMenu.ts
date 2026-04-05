import { useEffect, useMemo, useState } from "react";
import { useHelpers } from "@/shared/services/helpers/useHelpers";

export function useManageActionsMenu(tournamentId: number) {
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { state: helpersState, actions: helpersActions } = useHelpers(tournamentId);

  useEffect(() => {
    helpersActions.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  const availableCandidates = useMemo(
    () =>
      helpersState.candidates.filter(
        (candidate) => !helpersState.helpers.some((helper) => helper.id === candidate.id),
      ),
    [helpersState.candidates, helpersState.helpers],
  );

  const openParticipants = () => {
    setMenuOpen(false);
    setParticipantsOpen(true);
  };

  return {
    participantsOpen,
    menuOpen,
    helpersState,
    availableCandidates,
    helpersActions,
    setParticipantsOpen,
    setMenuOpen,
    openParticipants,
  };
}
