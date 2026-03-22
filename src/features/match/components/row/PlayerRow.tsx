import { Player } from "@/features/player/types/Player";

type PlayerRowProps = {
  player: Player;
};

export default function PlayerRow({ player }: PlayerRowProps) {
  return (
    <tr className="border-t border-gray-100">
      <td className="px-3 py-2 text-center font-medium text-gray-700">
        {player.playerName}
      </td>
    </tr>
  );
}
