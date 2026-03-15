import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { AuthState } from "./auth.reducer";
import { Account } from "../../models/Account";

interface AuthContextValue {
  state: AuthState;
  actions: {
    login: (username: string, password: string) => Promise<Account>;
    logout: () => void;
    register: (username: string, email: string, password: string, playerName?: string) => Promise<Account>;
    loadCurrentUser: () => Promise<void>;
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    auth.actions.loadCurrentUser();
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
