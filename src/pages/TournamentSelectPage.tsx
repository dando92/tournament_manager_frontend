import { Navigate } from "react-router-dom";
import { getSelectedTournament } from "@/services/recentTournaments";

export default function TournamentSelectPage() {
  const selected = getSelectedTournament();
  return <Navigate to={selected ? `/manage/${selected.id}` : "/select"} replace />;
}
