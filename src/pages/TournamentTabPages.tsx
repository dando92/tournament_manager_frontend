import LivePhase from "@/features/live/components/LivePhase";
import SongsList from "@/features/song/components/SongsList";
import { useTournamentPageContext } from "@/pages/TournamentPage";

export function TournamentSongsTab() {
  const { controls, tournamentId } = useTournamentPageContext();
  return <SongsList canEdit={controls} tournamentId={tournamentId} />;
}

export function TournamentLiveTab() {
  const { initialActiveLobbies, tournamentId } = useTournamentPageContext();
  return <LivePhase tournamentId={tournamentId} initialActiveLobbies={initialActiveLobbies} />;
}

export function TournamentStatsTab() {
  return <p className="text-sm text-gray-400 italic">Stats page coming soon.</p>;
}
