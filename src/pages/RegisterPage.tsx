import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../services/auth/AuthContext";

export default function RegisterPage() {
  const { actions } = useAuthContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await actions.register(username, email, password, playerName || undefined);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-3xl font-bold text-rossoTesto mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Display Name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-rossoTesto text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-rossoTesto hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
