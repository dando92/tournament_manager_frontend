import DivisionCard from "@/features/division/components/DivisionCard";
import { useTournamentPageContext } from "@/features/tournament/context/TournamentPageContext";
import { useNavigate } from "react-router-dom";

export default function TournamentDivisionsPage() {
  const { divisions, tournamentId, tournamentName } = useTournamentPageContext();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {divisions.map((division) => (
        <DivisionCard
          key={division.id}
          division={division}
          tournamentName={tournamentName}
          onSelect={() => navigate(`/tournament/${tournamentId}/division/${division.id}/phases`)}
        />
      ))}
      {divisions.length === 0 && (
        <p className="text-gray-400 text-sm">No divisions yet.</p>
      )}
    </div>
  );
}
