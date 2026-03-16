import { Link, useMatch, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/assets/icon.png";
import { useAuthContext } from "@/services/auth/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMusic,
  faGear,
  faUser,
  faRightToBracket,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

// [1] Compact top bar — visible only on mobile
export function MobileTopBar() {
  const tournamentMatch = useMatch("/manage/:tournamentId");
  const [activeTournamentName, setActiveTournamentName] = useState<string | null>(null);

  useEffect(() => {
    const tid = tournamentMatch?.params?.tournamentId;
    if (tid) {
      axios
        .get<{ name: string }>(`tournaments/${tid}`)
        .then((r) => setActiveTournamentName(r.data.name))
        .catch(() => setActiveTournamentName(null));
    } else {
      setActiveTournamentName(null);
    }
  }, [tournamentMatch?.params?.tournamentId]);

  return (
    <header className="flex md:hidden items-center gap-3 px-3 h-14 bg-rossoTag shrink-0">
      <img src={Logo} alt="logo" className="h-8 w-8 rounded shrink-0" />
      <span className="text-white font-bold text-base truncate">
        {activeTournamentName ?? "Tournament Manager"}
      </span>
    </header>
  );
}

// [4] Bottom navigation bar — visible only on mobile
function NavItem({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: IconDefinition;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
        active ? "text-rossoTesto font-semibold" : "text-gray-500"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="text-xl" />
      <span>{label}</span>
    </Link>
  );
}

export function MobileBottomNav() {
  const { state } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = state.account?.isAdmin;
  const [isHelper, setIsHelper] = useState(false);

  useEffect(() => {
    if (!state.account || state.account.isAdmin || state.account.isTournamentCreator) {
      setIsHelper(false);
      return;
    }
    axios
      .get<{ isHelper: boolean }>("tournaments/is-helper")
      .then((r) => setIsHelper(r.data.isHelper))
      .catch(() => setIsHelper(false));
  }, [state.account]);

  const canManage =
    state.account && (isAdmin || state.account.isTournamentCreator || isHelper);

  const isOnView =
    location.pathname === "/" || location.pathname.startsWith("/view");
  const isOnManage = location.pathname.startsWith("/manage");
  const isOnAccount =
    location.pathname === "/account" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  // Navigate to account or login depending on auth state
  function handleAccountNav() {
    navigate(state.account ? "/account" : "/login");
  }

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <NavItem to="/view" icon={faHouse} label="View" active={isOnView} />
      <NavItem to="/songs" icon={faMusic} label="Songs" active={location.pathname === "/songs"} />
      {canManage && (
        <NavItem to="/manage" icon={faGear} label="Manage" active={isOnManage} />
      )}
      {isAdmin && (
        <NavItem to="/admin/roles" icon={faUserShield} label="Roles" active={location.pathname === "/admin/roles"} />
      )}
      <button
        onClick={handleAccountNav}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs transition-colors ${
          isOnAccount ? "text-rossoTesto font-semibold" : "text-gray-500"
        }`}
      >
        <FontAwesomeIcon
          icon={state.account ? faUser : faRightToBracket}
          className="text-xl"
        />
        <span>{state.account ? "Account" : "Log in"}</span>
      </button>
    </nav>
  );
}
