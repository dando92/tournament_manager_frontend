import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@/services/auth/AuthContext";

interface ProtectedRouteProps {
  require?: "auth" | "admin" | "owner";
}

export default function ProtectedRoute({ require }: ProtectedRouteProps) {
  const { state } = useAuthContext();

  if (state.isLoading) {
    return null;
  }

  if (!state.account) {
    return <Navigate to="/login" replace />;
  }

  if (require === "admin" && !state.account.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (require === "owner" && !state.account.isTournamentCreator && !state.account.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
