import { Route, Routes } from "react-router-dom";
import "./App.css";
import ViewPage from "@/pages/ViewPage";
import ManagePage from "@/pages/ManagePage";
import TournamentSelectPage from "@/pages/TournamentSelectPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AccountInfoPage from "@/pages/AccountInfoPage";
import CreateTournamentPage from "@/pages/CreateTournamentPage";
import ManageRolesPage from "@/pages/ManageRolesPage";
import SongsPage from "@/pages/SongsPage";
import Sidebar from "@/components/layout/Sidebar";
import { MobileTopBar, MobileBottomNav } from "@/components/layout/MobileNav";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* [1] Mobile top bar — hidden on desktop */}
        <MobileTopBar />

        <ToastContainer style={{ zIndex: 99999 }} />

        {/* [2] Main content — pb-20 on mobile reserves space for the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          <Routes>
            <Route path="/" element={<ViewPage />} />
            <Route path="/view" element={<ViewPage />} />
            <Route path="/songs" element={<SongsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute require="auth" />}>
              <Route path="/account" element={<AccountInfoPage />} />
              <Route path="/manage" element={<TournamentSelectPage />} />
              <Route path="/manage/:tournamentId" element={<ManagePage />} />
            </Route>

            <Route element={<ProtectedRoute require="owner" />}>
              <Route path="/create-tournament" element={<CreateTournamentPage />} />
            </Route>

            <Route element={<ProtectedRoute require="admin" />}>
              <Route path="/admin/roles" element={<ManageRolesPage />} />
            </Route>

            <Route path="*" element={<ViewPage />} />
          </Routes>
        </main>

        {/* [4] Mobile bottom nav — hidden on desktop */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

export default App;
