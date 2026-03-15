import { useState } from "react";
import { useAuthContext } from "../services/auth/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function AccountInfoPage() {
  const { state, actions } = useAuthContext();
  const { account } = state;
  const [editingApi, setEditingApi] = useState(false);
  const [grooveStatsApi, setGrooveStatsApi] = useState(account?.grooveStatsApi ?? "");
  const [savedGrooveStatsApi, setSavedGrooveStatsApi] = useState(account?.grooveStatsApi ?? "");
  const [editingProfile, setEditingProfile] = useState(false);
  const [playerName, setPlayerName] = useState(account?.player?.playerName ?? "");
  const [nationality, setNationality] = useState(account?.nationality ?? "");
  const [saving, setSaving] = useState(false);

  if (!account) return null;

  async function saveGrooveStatsApi() {
    setSaving(true);
    try {
      await axios.patch(`user/${account.id}/groove-stats`, { grooveStatsApi });
      toast.success("API key updated.");
      setSavedGrooveStatsApi(grooveStatsApi);
      setEditingApi(false);
    } catch {
      toast.error("Failed to update API key.");
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await axios.patch(`user/${account.id}/profile`, { playerName, nationality });
      await actions.loadCurrentUser();
      toast.success("Profile updated.");
      setEditingProfile(false);
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h1 className="text-3xl font-bold text-rossoTesto mb-6">Account Info</h1>
      <div className="bg-gray-50 rounded-lg p-6 flex flex-col gap-3">
        <div>
          <span className="text-sm text-gray-500">Username</span>
          <p className="font-semibold">{account.username}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Email</span>
          <p className="font-semibold">{account.email}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Permissions</span>
          <p className="font-semibold">
            {account.isAdmin ? "Admin" : account.isTournamentCreator ? "Tournament Creator" : "Player"}
          </p>
        </div>
        <div>
          <div className="flex flex-row items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Player Info</span>
            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          {editingProfile ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player name..."
                className="border rounded px-3 py-1 text-sm w-full"
              />
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Nationality..."
                className="border rounded px-3 py-1 text-sm w-full"
              />
              <div className="flex flex-row gap-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="text-sm bg-rossoTesto text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingProfile(false);
                    setPlayerName(account.player?.playerName ?? "");
                    setNationality(account.nationality ?? "");
                  }}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{account.player?.playerName || <span className="text-gray-400 italic">Not set</span>}</p>
              <p className="text-sm text-gray-600">{account.nationality || <span className="text-gray-400 italic">No nationality set</span>}</p>
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-row items-center justify-between mb-1">
            <span className="text-sm text-gray-500">GrooveStats API Key</span>
            {!editingApi && (
              <button
                onClick={() => setEditingApi(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          {editingApi ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={grooveStatsApi}
                onChange={(e) => setGrooveStatsApi(e.target.value)}
                placeholder="Enter GrooveStats API key..."
                className="border rounded px-3 py-1 text-sm font-mono w-full"
              />
              <div className="flex flex-row gap-2">
                <button
                  onClick={saveGrooveStatsApi}
                  disabled={saving}
                  className="text-sm bg-rossoTesto text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingApi(false);
                    setGrooveStatsApi(savedGrooveStatsApi);
                  }}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="font-semibold font-mono text-sm">
              {savedGrooveStatsApi || <span className="text-gray-400 italic">Not set</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
