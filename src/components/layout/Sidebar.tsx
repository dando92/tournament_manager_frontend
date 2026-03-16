import { Link, useNavigate, useLocation, useMatch } from "react-router-dom";
import Logo from "@/assets/icon.png";
import { useAuthContext } from "@/services/auth/AuthContext";
import { usePageTitle } from "@/services/PageTitleContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMusic,
  faGear,
  faShield,
  faUser,
  faRightFromBracket,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

function SidebarLink({
  to,
  icon,
  children,
  active,
}: {
  to: string;
  icon?: IconDefinition;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
        active
          ? "bg-white/20 text-white font-semibold"
          : "text-red-100 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon && <FontAwesomeIcon icon={icon} className="w-4 shrink-0" />}
      <span>{children}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { state, actions } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = state.account?.isAdmin;

  const manageMatch = useMatch("/manage/:tournamentId");
  const viewMatch = useMatch("/view/:tournamentId");
  const tournamentMatch = manageMatch ?? viewMatch;
  const [routeTournamentName, setRouteTournamentName] = useState<string | null>(null);
  const [isHelper, setIsHelper] = useState(false);
  const { pageTitle } = usePageTitle();
  const activeTournamentName = pageTitle ?? routeTournamentName;

  useEffect(() => {
    const tid = tournamentMatch?.params?.tournamentId;
    if (tid) {
      axios
        .get<{ id: number; name: string }>(`tournaments/${tid}`)
        .then((r) => setRouteTournamentName(r.data.name))
        .catch(() => setRouteTournamentName(null));
    } else {
      setRouteTournamentName(null);
    }
  }, [tournamentMatch?.params?.tournamentId]);

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

  function handleLogout() {
    actions.logout();
    navigate("/");
  }

  const canManage =
    state.account && (isAdmin || state.account.isTournamentCreator || isHelper);

  const isOnView =
    location.pathname === "/" ||
    location.pathname === "/view" ||
    location.pathname.startsWith("/view");

  return (
    <aside className="hidden md:flex w-56 min-h-screen bg-rossoTag flex-col shrink-0 border-r border-white/10">
      {/* [1] Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <img src={Logo} alt="logo" className="h-10 w-10 rounded-lg shrink-0" />
        <div className="min-w-0">
          <h2 className="text-white font-bold text-base leading-tight truncate">
            {activeTournamentName ?? "Tournament Manager"}
          </h2>
          {activeTournamentName && (
            <span className="text-red-200 text-xs leading-tight block">
              Tournament Manager
            </span>
          )}
        </div>
      </div>

      {/* [2] Navigation */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        <SidebarLink to="/view" icon={faHouse} active={isOnView}>
          View
        </SidebarLink>
        <SidebarLink
          to="/songs"
          icon={faMusic}
          active={location.pathname === "/songs"}
        >
          Songs
        </SidebarLink>
        {canManage && (
          <SidebarLink
            to="/manage"
            icon={faGear}
            active={location.pathname.startsWith("/manage")}
          >
            Manage
          </SidebarLink>
        )}
        {isAdmin && (
          <SidebarLink
            to="/admin/roles"
            icon={faShield}
            active={location.pathname === "/admin/roles"}
          >
            Manage Roles
          </SidebarLink>
        )}

        {state.account && (
          <>
            <div className="border-t border-white/10 my-2" />
            <SidebarLink
              to="/account"
              icon={faUser}
              active={location.pathname === "/account"}
            >
              Account
            </SidebarLink>
          </>
        )}

        {/* Login/Logout pinned to bottom */}
        <div className="mt-auto pt-2 border-t border-white/10">
          {state.account ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-red-100 hover:bg-white/10 hover:text-white transition-colors text-left w-full"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 shrink-0" />
              <span>Logout</span>
            </button>
          ) : (
            <SidebarLink
              to="/login"
              icon={faRightToBracket}
              active={
                location.pathname === "/login" ||
                location.pathname === "/register"
              }
            >
              Login / Register
            </SidebarLink>
          )}
        </div>
      </nav>
    </aside>
  );
}
