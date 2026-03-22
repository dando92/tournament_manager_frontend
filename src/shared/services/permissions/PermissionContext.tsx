import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "@/features/auth/context/AuthContext";

interface PermissionState {
  isAdmin: boolean;
  canCreateTournament: boolean;
  ownedTournamentIds: number[];
  helperTournamentIds: number[];
  isLoaded: boolean;
}

interface PermissionContextValue extends PermissionState {
  canEditTournament: (tournamentId: number) => boolean;
  canEditHelpers: (tournamentId: number) => boolean;
  reload: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

const EMPTY_STATE: PermissionState = {
  isAdmin: false,
  canCreateTournament: false,
  ownedTournamentIds: [],
  helperTournamentIds: [],
  isLoaded: false,
};

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { state: authState } = useAuthContext();
  const account = authState.account;

  const [permissions, setPermissions] = useState<PermissionState>(EMPTY_STATE);

  const load = useCallback(async () => {
    if (!account) {
      setPermissions({ ...EMPTY_STATE, isLoaded: true });
      return;
    }

    if (account.isAdmin) {
      setPermissions({
        isAdmin: true,
        canCreateTournament: true,
        ownedTournamentIds: [],
        helperTournamentIds: [],
        isLoaded: true,
      });
      return;
    }

    try {
      const { data } = await axios.get<{ ownedTournamentIds: number[]; helperTournamentIds: number[] }>(
        "tournaments/my-roles"
      );
      setPermissions({
        isAdmin: false,
        canCreateTournament: account.isTournamentCreator,
        ownedTournamentIds: data.ownedTournamentIds,
        helperTournamentIds: data.helperTournamentIds,
        isLoaded: true,
      });
    } catch {
      setPermissions({
        isAdmin: false,
        canCreateTournament: account.isTournamentCreator,
        ownedTournamentIds: [],
        helperTournamentIds: [],
        isLoaded: true,
      });
    }
  }, [account]);

  useEffect(() => {
    load();
  }, [load]);

  const canEditTournament = useCallback(
    (tournamentId: number): boolean => {
      if (permissions.isAdmin) return true;
      return (
        permissions.ownedTournamentIds.includes(tournamentId) ||
        permissions.helperTournamentIds.includes(tournamentId)
      );
    },
    [permissions]
  );

  const canEditHelpers = useCallback(
    (tournamentId: number): boolean => {
      if (permissions.isAdmin) return true;
      return permissions.ownedTournamentIds.includes(tournamentId);
    },
    [permissions]
  );

  return (
    <PermissionContext.Provider
      value={{ ...permissions, canEditTournament, canEditHelpers, reload: load }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePermissions(): PermissionContextValue {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermissions must be used within PermissionProvider");
  return ctx;
}
