import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { Tournament } from "@/models/Tournament";

type Props = {
  t: Tournament;
  onClick: () => void;
};

export default function TournamentRow({ t, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="flex flex-row items-center gap-4 bg-gray-100 hover:bg-gray-200 cursor-pointer px-5 py-4 rounded-lg"
    >
      <FontAwesomeIcon icon={faTrophy} className="text-rossoTesto text-xl" />
      <span className="text-lg font-semibold text-gray-800">{t.name}</span>
      <span className="text-gray-400 text-sm ml-auto">#{t.id}</span>
    </div>
  );
}
