import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "@/assets/icon.png";
import { useAuthContext } from "@/services/auth/AuthContext";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import SearchTournamentModal from "@/components/modals/SearchTournamentModal";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faGear,
  faShield,
  faUser,
  faRightFromBracket,
  faRightToBracket,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import {
  getRecentTournaments,
  selectRecentTournament,
  type RecentTournament,
} from "@/services/recentTournaments";
import { useSidebar } from "@/context/SidebarContext";

// ── Scrolling text — animates when text overflows the container ───────────────
function ScrollingText({ text }: { text: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useLayoutEffect(() => {
    if (containerRef.current && textRef.current) {
      setShouldScroll(textRef.current.scrollWidth > containerRef.current.offsetWidth);
    }
  }, [text]);

  return (
    <span ref={containerRef} className="overflow-hidden block min-w-0 flex-1" title={text}>
      <span
        ref={textRef}
        className={`block whitespace-nowrap ${shouldScroll ? "animate-marquee" : ""}`}
      >
        {text}
      </span>
    </span>
  );
}

// ── Tournament button in sidebar ──────────────────────────────────────────────
function TournamentButton({
  tournament,
  selected,
  onClick,
}: {
  tournament: RecentTournament;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={tournament.name}
      className={`flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors w-full text-left ${
        selected
          ? "bg-white/20 text-white font-semibold"
          : "text-red-100 hover:bg-white/10 hover:text-white"
      }`}
    >
      {tournament.logo ? (
        <img
          src={tournament.logo}
          alt=""
          className="h-6 w-6 rounded shrink-0 object-cover"
        />
      ) : (
        <FontAwesomeIcon icon={faTrophy} className="w-4 shrink-0" />
      )}
      <ScrollingText text={tournament.name} />
    </button>
  );
}

// ── Nav link ──────────────────────────────────────────────────────────────────
function SidebarLink({
  to,
  icon,
  children,
  active,
  onClick,
}: {
  to: string;
  icon?: React.ComponentProps<typeof FontAwesomeIcon>["icon"];
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
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

// ── Main Sidebar ──────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { state, actions } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, close } = useSidebar();
  const isAdmin = state.account?.isAdmin;
  const [isHelper, setIsHelper] = useState(false);

  const [recentTournaments, setRecentTournaments] = useState<RecentTournament[]>(
    getRecentTournaments,
  );

  // Re-read recent tournaments on location change (user may have selected one)
  useEffect(() => {
    setRecentTournaments(getRecentTournaments());
  }, [location.pathname]);

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
    close();
  }

  const canManage = state.account && (isAdmin || state.account.isTournamentCreator || isHelper);
  const selectedTournament = recentTournaments[0] ?? null;
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const accountPages = ["/account", "/login", "/register", "/admin/roles"];

  function handleTournamentClick(t: RecentTournament) {
    selectRecentTournament(t.id);
    setRecentTournaments(getRecentTournaments());
    close();

    if (accountPages.some((p) => location.pathname === p)) return;

    if (location.pathname.startsWith("/manage/")) {
      navigate(`/manage/${t.id}`);
    } else {
      navigate(`/view/${t.id}`);
    }
  }


  const content = (
    <aside className="flex flex-col w-56 h-full bg-rossoTag border-r border-white/10">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 shrink-0">
        <img src={Logo} alt="logo" className="h-10 w-10 rounded-lg shrink-0" />
        <h2 className="text-white font-bold text-base leading-tight">
          Tournament<br />Manager
        </h2>
      </div>

      {/* Create button */}
      <div className="p-3 border-b border-white/10 shrink-0 flex flex-col gap-2">
        <button
          onClick={() => { navigate(state.account ? "/?create=1" : "/login"); close(); }}
          className="flex items-center justify-center gap-2 w-full bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-3 py-2 rounded transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
          Create tournament
        </button>
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-3 py-2 rounded transition-colors"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs" />
          Search tournament
        </button>
      </div>

      {/* Recent tournaments */}
      <div className="flex flex-col gap-0.5 p-3 border-b border-white/10 shrink-0">
        <p className="text-red-200 text-xs uppercase tracking-wide mb-1 px-1">Recent tournaments</p>
        {recentTournaments.length > 0 ? (
          recentTournaments.map((t) => (
            <TournamentButton
              key={t.id}
              tournament={t}
              selected={t.id === selectedTournament?.id}
              onClick={() => handleTournamentClick(t)}
            />
          ))
        ) : (
          <p className="text-red-300 text-xs px-1 italic">No recent tournaments</p>
        )}
      </div>

      {/* Navigation — shown when at least one tournament is selected */}
      {recentTournaments.length > 0 && (
        <nav className="flex flex-col gap-0.5 p-3 shrink-0">
          {canManage && (
            <SidebarLink
              to={`/manage/${selectedTournament!.id}`}
              icon={faGear}
              active={location.pathname.startsWith("/manage")}
              onClick={close}
            >
              Manage
            </SidebarLink>
          )}
        </nav>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: account / login / manage roles */}
      <div className="flex flex-col gap-0.5 p-3 border-t border-white/10 shrink-0">
        {isAdmin && (
          <SidebarLink
            to="/admin/roles"
            icon={faShield}
            active={location.pathname === "/admin/roles"}
            onClick={close}
          >
            Manage Roles
          </SidebarLink>
        )}
        {state.account && (
          <SidebarLink
            to="/account"
            icon={faUser}
            active={location.pathname === "/account"}
            onClick={close}
          >
            Account
          </SidebarLink>
        )}
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
              location.pathname === "/login" || location.pathname === "/register"
            }
            onClick={close}
          >
            Login / Register
          </SidebarLink>
        )}
      </div>
    </aside>
  );

  return (
    <>
      <SearchTournamentModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* Desktop: always visible */}
      <div className="hidden md:flex min-h-screen shrink-0">{content}</div>

      {/* Mobile: overlay drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={close}
          />
          {/* Drawer */}
          <div className="relative z-10 flex h-full">{content}</div>
        </div>
      )}
    </>
  );
}
