import { Link, useNavigate, useMatch, useSearchParams } from "react-router-dom";
import Logo from "@/assets/icon.png";
import { useAuthContext } from "@/services/auth/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const { state, actions } = useAuthContext();
  const navigate = useNavigate();
  const isAdmin = state.account?.isAdmin;

  const tournamentMatch = useMatch('/tournament/:tournamentId');
  const [searchParams] = useSearchParams();
  const isLive = searchParams.get("live") === "1";
  const [activeTournamentName, setActiveTournamentName] = useState<string | null>(null);

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
          {tournamentMatch?.params?.tournamentId && (
            <Link
              to={isLive
                ? `/tournament/${tournamentMatch.params.tournamentId}`
                : `/tournament/${tournamentMatch.params.tournamentId}?live=1`}
              className={`flex items-center gap-1.5 text-sm ${isLive ? "text-white font-semibold" : "text-red-200 hover:text-white"}`}
            >
              <FontAwesomeIcon icon={faCircle} className="animate-pulse text-xs" />
              Live
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
