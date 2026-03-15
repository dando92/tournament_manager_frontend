type Props = {
  open: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function LobbyPasswordModal({
  open,
  password,
  onPasswordChange,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-80 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Connect to lobby</h2>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Password (leave empty if none)</label>
          <input
            type="password"
            className="border border-gray-300 rounded px-3 py-1.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-rossoTesto"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onConfirm()}
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded text-sm bg-rossoTesto text-white hover:opacity-90"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
