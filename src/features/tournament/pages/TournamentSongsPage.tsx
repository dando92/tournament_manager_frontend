import SongsList from "@/features/song/components/SongsList";
import { useTournamentPageContext } from "@/features/tournament/context/TournamentPageContext";

export default function TournamentSongsPage() {
  const { controls, tournamentId } = useTournamentPageContext();
  return <SongsList canEdit={controls} tournamentId={tournamentId} />;
}
