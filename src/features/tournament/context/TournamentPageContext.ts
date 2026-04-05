import type { Dispatch, SetStateAction } from "react";
import { useOutletContext } from "react-router-dom";
import { TournamentDivisionOption } from "@/features/tournament/types/TournamentDivisionOption";
export type TournamentPageContextValue = {
  tournamentId: number;
  tournamentName: string;
  syncstartUrl: string;
  songsVersion: number;
  divisions: TournamentDivisionOption[];
  controls: boolean;
  helpersEnabled: boolean;
  setSyncstartUrl: Dispatch<SetStateAction<string>>;
  refreshDivisions: () => Promise<void>;
  refreshSongs: () => void;
  openCreateDivision: () => void;
  openCreatePhase: () => void;
  openCreateMatch: () => void;
  openGenerateBracketPicker: () => void;
};

export function useTournamentPageContext() {
  return useOutletContext<TournamentPageContextValue>();
}
