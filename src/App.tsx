import { Outlet, Route, Routes, useParams } from "react-router-dom";
import { PageTitleProvider } from "@/services/PageTitleContext";
import { SidebarProvider } from "@/context/SidebarContext";
import "./App.css";
import HomePage from "@/pages/HomePage";
import TournamentPage from "@/pages/TournamentPage";
import SelectTournamentPage from "@/pages/SelectTournamentPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AccountInfoPage from "@/pages/AccountInfoPage";
import ManageRolesPage from "@/pages/ManageRolesPage";
import SongsPage from "@/pages/SongsPage";
import OBSPage from "@/pages/OBSPage";
import Sidebar from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileNav";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function KeyedSongsPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <SongsPage key={tournamentId} />;
}

function KeyedTournamentPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <TournamentPage key={tournamentId ?? "none"} />;
}

function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <ToastContainer style={{ zIndex: 99999 }} />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <PageTitleProvider>
      <SidebarProvider>
        <Routes>
          {/* Standalone route — no sidebar/nav, used as OBS browser source */}
          <Route path="/obs/:lobbyId" element={<OBSPage />} />

          {/* Main layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />

            {/* Tournament page — merged view + manage */}
            <Route path="/tournament" element={<TournamentPage />} />
            <Route path="/tournament/:tournamentId" element={<KeyedTournamentPage />} />

            {/* Tournament browser */}
            <Route path="/select" element={<SelectTournamentPage />} />

            <Route path="/songs" element={<SongsPage />} />
            <Route path="/songs/:tournamentId" element={<KeyedSongsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute require="auth" />}>
              <Route path="/account" element={<AccountInfoPage />} />
            </Route>

            <Route element={<ProtectedRoute require="admin" />}>
              <Route path="/admin/roles" element={<ManageRolesPage />} />
            </Route>

            <Route path="*" element={<SelectTournamentPage />} />
          </Route>
        </Routes>
      </SidebarProvider>
    </PageTitleProvider>
  );
}

export default App;
