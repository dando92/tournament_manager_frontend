import { Route, Routes } from "react-router-dom";
import "./App.css";
import ViewPage from "./pages/ViewPage";
import ManagePage from "./pages/ManagePage";
import TournamentSelectPage from "./pages/TournamentSelectPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountInfoPage from "./pages/AccountInfoPage";
import CreateTournamentPage from "./pages/CreateTournamentPage";
import ManageRolesPage from "./pages/ManageRolesPage";
import SongsPage from "./pages/SongsPage";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div>
      <Navbar />
      <ToastContainer />
      <div className="lg:container lg:mx-auto mx-3 mt-3">
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
      </div>
    </div>
  );
}

export default App;
