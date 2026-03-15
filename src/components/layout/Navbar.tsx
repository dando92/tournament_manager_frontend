import { Link, useNavigate, useMatch } from "react-router-dom";
import Logo from "@/assets/icon.png";
import { useAuthContext } from "@/services/auth/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const { state, actions } = useAuthContext();
  const navigate = useNavigate();
  const isAdmin = state.account?.isAdmin;

  const tournamentMatch = useMatch('/manage/:tournamentId');
  const [activeTournamentName, setActiveTournamentName] = useState<string | null>(null);
  const [isHelper, setIsHelper] = useState(false);

  useEffect(() => {
    const tid = tournamentMatch?.params?.tournamentId;
    if (tid) {
      axios.get<{ id: number; name: string }>(`tournaments/${tid}`)
        .then(r => setActiveTournamentName(r.data.name))
        .catch(() => setActiveTournamentName(null));
    } else {
      setActiveTournamentName(null);
    }
  }, [tournamentMatch?.params?.tournamentId]);

  useEffect(() => {
    if (!state.account || state.account.isAdmin || state.account.isTournamentCreator) {
      setIsHelper(false);
      return;
    }
    axios.get<{ isHelper: boolean }>('tournaments/is-helper')
      .then(r => setIsHelper(r.data.isHelper))
      .catch(() => setIsHelper(false));
  }, [state.account]);

  function handleLogout() {
    actions.logout();
    navigate("/");
  }

  return (
    <nav className="w-full h-16 bg-rossoTag">
      <div className="lg:container lg:mx-auto mx-3 flex flex-row gap-6 items-center h-full">
        <img src={Logo} alt="logo" className="h-12 w-12 rounded-lg" />
        <div className="flex flex-col">
          <h2 className="text-white font-bold text-xl leading-tight">
            {activeTournamentName ?? 'Tournament Manager'}
          </h2>
          {activeTournamentName && (
            <span className="text-red-200 text-sm leading-tight">Tournament Manager</span>
          )}
        </div>
        <div className="flex flex-row gap-4 ml-auto items-center">
          <Link to="/view" className="text-white hover:underline text-sm">
            View
          </Link>
          <Link to="/songs" className="text-white hover:underline text-sm">
            Songs
          </Link>
          {state.account && (state.account.isAdmin || state.account.isTournamentCreator || isHelper) && (
            <Link to="/manage" className="text-white hover:underline text-sm">
              Manage
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/roles" className="text-white hover:underline text-sm">
              Manage Roles
            </Link>
          )}
          {state.account ? (
            <>
              <Link to="/account" className="text-white hover:underline text-sm">
                Account Info
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:underline text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:underline text-sm">
                Login
              </Link>
              <Link to="/register" className="text-white hover:underline text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
