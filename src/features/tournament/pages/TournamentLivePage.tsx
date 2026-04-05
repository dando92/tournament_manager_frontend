import LivePhase from "@/features/live/components/LivePhase";
import { useTournamentPageContext } from "@/features/tournament/context/TournamentPageContext";

export default function TournamentLivePage() {
  const { tournamentId } = useTournamentPageContext();
  return <LivePhase tournamentId={tournamentId} />;
}
