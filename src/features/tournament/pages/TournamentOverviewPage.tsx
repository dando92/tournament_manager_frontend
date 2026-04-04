import DivisionCard from "@/features/division/components/DivisionCard";
import { useTournamentPageContext } from "@/features/tournament/context/TournamentPageContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TournamentOverviewPage() {
  const { divisions, tournamentId, controls, refreshDivisions } = useTournamentPageContext();
  const navigate = useNavigate();

  const divisionCount = divisions.length;
  const playerCount = divisions.reduce((count, division) => count + (division.players?.length ?? 0), 0);
  const matchCount = divisions.reduce(
    (count, division) => count + (division.phases ?? []).reduce((sum, phase) => sum + (phase.matches?.length ?? 0), 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Divisions</div>
          <div className="mt-2 text-3xl font-black text-primary-dark">{divisionCount}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Players / Matches</div>
          <div className="mt-2 text-3xl font-black text-primary-dark">{playerCount} / {matchCount}</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">Divisions</h2>
          <p className="text-sm text-gray-500">Quick access to each division page.</p>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((division) => (
            <DivisionCard
              key={division.id}
              division={division}
              controls={controls}
              onSelect={() => navigate(`/tournament/${tournamentId}/division/${division.id}/phases`)}
              onDelete={async () => {
                if (!window.confirm(`Delete division "${division.name}"?`)) return;
                await axios.delete(`divisions/${division.id}`);
                await refreshDivisions();
              }}
            />
          ))}
          {divisions.length === 0 && (
            <p className="text-sm text-gray-400">No divisions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
