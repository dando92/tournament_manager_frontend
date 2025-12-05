import { Route, Routes } from "react-router-dom";
import "./App.css";
import ViewPage from "./pages/ViewPage";
import ManagePage from "./pages/ManagePage";
import Navbar from "./components/layout/Navbar";
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
          <Route path="/manage" element={<ManagePage />} />
          <Route path="*" element={<ViewPage />}></Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
