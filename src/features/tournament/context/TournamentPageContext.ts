import { useOutletContext } from "react-router-dom";
import { Division } from "@/features/division/types/Division";
import { ActiveLobbyDto } from "@/features/live/services/useScoreHub";

export type TournamentPageContextValue = {
  tournamentId: number;
  tournamentName: string;
  divisions: Division[];
  controls: boolean;
  helpersEnabled: boolean;
  initialActiveLobbies: ActiveLobbyDto[];
  refreshDivisions: () => Promise<void>;
  openCreateDivision: () => void;
  openGenerateBracketPicker: () => void;
};

export function useTournamentPageContext() {
  return useOutletContext<TournamentPageContextValue>();
}
