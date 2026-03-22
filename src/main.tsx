import ReactDOM from "react-dom/client";
import App from "@/App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { AuthProvider } from "@/services/auth/AuthContext.tsx";
import { PermissionProvider } from "@/services/permissions/PermissionContext.tsx";

axios.defaults.baseURL = import.meta.env.VITE_PUBLIC_API_URL!;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <PermissionProvider>
        <App />
      </PermissionProvider>
    </AuthProvider>
  </BrowserRouter>,
);
