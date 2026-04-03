import LivePhase from "@/features/live/components/LivePhase";
import { useTournamentPageContext } from "@/features/tournament/context/TournamentPageContext";

export default function TournamentLivePage() {
  const { initialActiveLobbies, tournamentId } = useTournamentPageContext();
  return <LivePhase tournamentId={tournamentId} initialActiveLobbies={initialActiveLobbies} />;
}
