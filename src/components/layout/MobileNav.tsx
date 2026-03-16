import { useLocation, useNavigate } from "react-router-dom";
import Logo from "@/assets/icon.png";
import { useAuthContext } from "@/services/auth/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMagnifyingGlass,
  faRightToBracket,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useSidebar } from "@/context/SidebarContext";
import { useMatch } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// [1] Compact top bar — visible only on mobile
export function MobileTopBar() {
  const manageMatch = useMatch("/manage/:tournamentId");
  const viewMatch = useMatch("/view/:tournamentId");
  const tournamentMatch = manageMatch ?? viewMatch;
  const [routeTournamentName, setRouteTournamentName] = useState<string | null>(null);

  useEffect(() => {
    const tid = tournamentMatch?.params?.tournamentId;
    if (tid) {
      axios
        .get<{ name: string }>(`tournaments/${tid}`)
        .then((r) => setRouteTournamentName(r.data.name))
        .catch(() => setRouteTournamentName(null));
    } else {
      setRouteTournamentName(null);
    }
  }, [tournamentMatch?.params?.tournamentId]);

  return (
    <header className="flex md:hidden items-center gap-3 px-3 h-14 bg-rossoTag shrink-0">
      <img src={Logo} alt="logo" className="h-8 w-8 rounded shrink-0" />
      <span className="text-white font-bold text-base truncate">
        {routeTournamentName ?? "Tournament Manager"}
      </span>
    </header>
  );
}

// [2] Bottom navigation bar — visible only on mobile
export function MobileBottomNav() {
  const { state, actions } = useAuthContext();
  const { toggle } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const isOnAccount =
    location.pathname === "/account" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  function handleLogout() {
    actions.logout();
    navigate("/");
  }

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 h-14">
      {/* Left: menu button */}
      <button
        onClick={toggle}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs text-gray-500 hover:text-rossoTesto transition-colors"
      >
        <FontAwesomeIcon icon={faBars} className="text-xl" />
        <span>Menu</span>
      </button>

      {/* Center: search / tournament select */}
      <button
        onClick={() => navigate("/select")}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
          location.pathname === "/select" ? "text-rossoTesto font-semibold" : "text-gray-500"
        }`}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xl" />
        <span>Search</span>
      </button>

      {/* Right: login/logout */}
      {state.account ? (
        <button
          onClick={handleLogout}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
            isOnAccount ? "text-rossoTesto font-semibold" : "text-gray-500"
          }`}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="text-xl" />
          <span>Logout</span>
        </button>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
            isOnAccount ? "text-rossoTesto font-semibold" : "text-gray-500"
          }`}
        >
          <FontAwesomeIcon icon={faRightToBracket} className="text-xl" />
          <span>Login</span>
        </button>
      )}
    </nav>
  );
}
