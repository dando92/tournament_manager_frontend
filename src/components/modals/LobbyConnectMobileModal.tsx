import BaseModal from "@/components/modals/BaseModal";
import { btnPrimary } from "@/utils/buttonStyles";

type Props = {
  open: boolean;
  lobbyCode: string;
  onLobbyCodeChange: (value: string) => void;
  onSaveLobbyCode: () => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onConnect: () => void;
  onCancel: () => void;
};

export default function LobbyConnectMobileModal({
  open,
  lobbyCode,
  onLobbyCodeChange,
  onSaveLobbyCode,
  password,
  onPasswordChange,
  onConnect,
  onCancel,
}: Props) {
  return (
    <BaseModal
      open={open}
      onClose={onCancel}
      title="Connect to lobby"
      maxWidth="max-w-sm"
      footer={
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button onClick={onConnect} className={`text-sm ${btnPrimary}`}>
            Connect
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Lobby code</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-rossoTesto"
              value={lobbyCode}
              onChange={(e) => onLobbyCodeChange(e.target.value)}
              placeholder="e.g. ABC123"
            />
            <button
              onClick={onSaveLobbyCode}
              className="px-3 py-1.5 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            >
              Save
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Password (leave empty if none)</label>
          <input
            type="password"
            className="border border-gray-300 rounded px-3 py-1.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-rossoTesto"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onConnect()}
            autoFocus
          />
        </div>
      </div>
    </BaseModal>
  );
}
