import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { Player } from "@/models/Player";
import { Account } from "@/models/Account";
import BaseModal from "@/components/modals/BaseModal";

type PlayersSection = {
  tournamentPlayers: Player[];
  availableToAdd: Player[];
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
};

type HelpersSection = {
  helpers: Account[];
  availableCandidates: Account[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  players: PlayersSection;
  helpers: HelpersSection;
  canEditHelpers: boolean;
};

export default function ManageParticipantsModal({
  open,
  onClose,
  players,
  helpers,
  canEditHelpers,
}: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedHelperId, setSelectedHelperId] = useState("");

  return (
    <BaseModal open={open} onClose={onClose} title="Participants" maxWidth="max-w-3xl">
      <div className="flex flex-row gap-6">
        {/* Players section */}
        <div className="flex-1">
          <h4 className="font-semibold text-rossoTesto mb-2">Players</h4>

          {players.availableToAdd.length > 0 && (
            <select
              className="border rounded px-2 py-1 text-sm w-full mb-2"
              value={selectedPlayerId}
              onChange={(e) => {
                if (e.target.value) {
                  players.onAdd(Number(e.target.value));
                  setSelectedPlayerId("");
                } else {
                  setSelectedPlayerId(e.target.value);
                }
              }}
            >
              <option value="" disabled>
                Add player...
              </option>
              {players.availableToAdd.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.playerName}
                </option>
              ))}
            </select>
          )}

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {players.tournamentPlayers.length === 0 && (
              <p className="text-sm text-gray-500">No players assigned yet.</p>
            )}
            {players.tournamentPlayers.map((p) => (
              <div
                key={p.id}
                className="flex flex-row items-center justify-between bg-gray-50 px-3 py-2 rounded"
              >
                <span className="text-sm font-medium">{p.playerName}</span>
                <button
                  onClick={() => players.onRemove(p.id)}
                  className="text-red-500 text-sm hover:underline"
                  title="Remove from tournament"
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Helpers section */}
        <div className="flex-1">
          <h4 className="font-semibold text-rossoTesto mb-2">Tournament Helpers</h4>

          {canEditHelpers && helpers.availableCandidates.length > 0 && (
            <select
              className="border rounded px-2 py-1 text-sm w-full mb-2"
              value={selectedHelperId}
              onChange={(e) => {
                if (e.target.value) {
                  helpers.onAdd(e.target.value);
                  setSelectedHelperId("");
                } else {
                  setSelectedHelperId(e.target.value);
                }
              }}
            >
              <option value="" disabled>
                Add helper...
              </option>
              {helpers.availableCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.username}
                </option>
              ))}
            </select>
          )}

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {helpers.helpers.length === 0 && (
              <p className="text-sm text-gray-500">No helpers assigned yet.</p>
            )}
            {helpers.helpers.map((h) => (
              <div
                key={h.id}
                className="flex flex-row items-center justify-between bg-gray-50 px-3 py-2 rounded"
              >
                <span className="text-sm font-medium">{h.username}</span>
                {canEditHelpers && (
                  <button
                    onClick={() => helpers.onRemove(h.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
