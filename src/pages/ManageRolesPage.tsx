import { useEffect, useState } from "react";
import axios from "axios";
import { Account } from "../models/Account";
import { toast } from "react-toastify";

export default function ManageRolesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get<Account[]>("user").then((r) => {
      setAccounts(r.data);
    }).catch(() => {
      toast.error("Failed to load accounts.");
    }).finally(() => setLoading(false));
  }, []);

  async function handleFlagChange(accountId: string, flag: "isAdmin" | "isTournamentCreator", value: boolean) {
    try {
      const updated = await axios.patch<Account>(`user/${accountId}/flags`, { [flag]: value });
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? updated.data : a))
      );
      toast.success("Updated.");
    } catch {
      toast.error("Failed to update.");
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-rossoTesto mb-6">Manage Roles</h1>
      <div className="flex flex-col gap-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex flex-row items-center justify-between bg-gray-50 px-5 py-4 rounded-lg"
          >
            <div>
              <p className="font-semibold">{account.username}</p>
              <p className="text-sm text-gray-500">{account.email}</p>
            </div>
            <div className="flex flex-row gap-6">
              <label className="flex flex-row items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={account.isTournamentCreator}
                  onChange={(e) => handleFlagChange(account.id, "isTournamentCreator", e.target.checked)}
                />
                <span className="text-sm">Tournament Creator</span>
              </label>
              <label className="flex flex-row items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={account.isAdmin}
                  onChange={(e) => handleFlagChange(account.id, "isAdmin", e.target.checked)}
                />
                <span className="text-sm">Admin</span>
              </label>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="text-gray-500">No accounts found.</p>
        )}
      </div>
    </div>
  );
}
