import TournamentSettings from "@/components/manage/tournament/TournamentSettings";
import ManageActionsMenu from "@/components/manage/ManageActionsMenu";
import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useMatchHub } from "@/services/useMatchHub";
import axios from "axios";
import { useAuthContext } from "@/services/auth/AuthContext";

export default function ManagePage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { state: authState } = useAuthContext();
  const account = authState.account;

  const [isTournamentOwner, setIsTournamentOwner] = useState(false);
  const [isHelper, setIsHelper] = useState(false);

  const isAdmin = account?.isAdmin ?? false;
  const canEditHelpers = isAdmin || isTournamentOwner;
  const canControl = isAdmin || isTournamentOwner || isHelper;

  const [matchUpdateSignal, setMatchUpdateSignal] = useState(0);
  const onMatchUpdate = useCallback(() => { setMatchUpdateSignal((s) => s + 1); }, []);
  useMatchHub(onMatchUpdate, Number(tournamentId) || undefined);

  useEffect(() => {
    if (!tournamentId) return;
    axios
      .get<{ id: number; name: string; owner?: { id: string } }>(`tournaments/${tournamentId}`)
      .then((r) => {
        document.title = `${r.data.name} — Tournament Manager`;
        if (account && r.data.owner?.id === account.id) {
          setIsTournamentOwner(true);
        }
      })
      .catch(() => {});
    return () => { document.title = "Tournament Manager"; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId, account?.id]);

  useEffect(() => {
    if (!account || isAdmin) return;
    axios
      .get<{ isHelper: boolean }>("tournaments/is-helper")
      .then((r) => setIsHelper(r.data.isHelper))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id, isAdmin]);

  return (
    <div>
      <TournamentSettings
        controls={canControl}
        tournamentId={Number(tournamentId)}
        matchUpdateSignal={matchUpdateSignal}
        headerActions={
          canControl && tournamentId ? (
            <ManageActionsMenu
              tournamentId={tournamentId}
              canEditHelpers={canEditHelpers}
            />
          ) : undefined
        }
      />
    </div>
  );
}
