import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/features/auth/context/AuthContext";

interface ProtectedRouteProps {
  require?: "auth" | "admin" | "owner";
}

export default function ProtectedRoute({ require }: ProtectedRouteProps) {
  const { state } = useAuthContext();
  const location = useLocation();

  if (state.isLoading) {
    return null;
  }

  if (!state.account) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (require === "admin" && !state.account.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (require === "owner" && !state.account.isTournamentCreator && !state.account.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
