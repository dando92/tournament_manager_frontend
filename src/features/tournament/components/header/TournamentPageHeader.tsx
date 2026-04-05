import type { Dispatch, SetStateAction } from "react";
import ManageActionsMenu from "@/features/match/components/ManageActionsMenu";
import TournamentHeaderCreateMenu from "@/features/tournament/components/header/TournamentHeaderCreateMenu";
import TournamentHeaderLobbyManageMenu from "@/features/tournament/components/header/TournamentHeaderLobbyManageMenu";
import TournamentHeaderSongsManageMenu from "@/features/tournament/components/header/TournamentHeaderSongsManageMenu";

type TournamentPageHeaderProps = {
  tournamentId: number;
  tournamentName: string;
  headerSubtitle: string;
  controls: boolean;
  helpersEnabled: boolean;
  isOverviewPage: boolean;
  isSongsPage: boolean;
  isLobbiesPage: boolean;
  syncstartUrl: string;
  setSyncstartUrl: Dispatch<SetStateAction<string>>;
  songsVersion: number;
  refreshSongs: () => void;
  createMenuOpen: boolean;
  setCreateMenuOpen: Dispatch<SetStateAction<boolean>>;
  hasDivisions: boolean;
  hasPhases: boolean;
  onCreateDivision: () => void;
  onGenerateBracket: () => void;
  onCreatePhase: () => void;
  onCreateMatch: () => void;
};

export default function TournamentPageHeader({
  tournamentId,
  tournamentName,
  headerSubtitle,
  controls,
  helpersEnabled,
  isOverviewPage,
  isSongsPage,
  isLobbiesPage,
  syncstartUrl,
  setSyncstartUrl,
  songsVersion,
  refreshSongs,
  createMenuOpen,
  setCreateMenuOpen,
  hasDivisions,
  hasPhases,
  onCreateDivision,
  onGenerateBracket,
  onCreatePhase,
  onCreateMatch,
}: TournamentPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-2xl font-black text-gray-900">{tournamentName}</h1>
        <p className="text-sm text-gray-500">{headerSubtitle}</p>
      </div>

      {controls && (
        <div className="flex items-center gap-2 ml-auto">
          {isOverviewPage && (
            <TournamentHeaderCreateMenu
              open={createMenuOpen}
              setOpen={setCreateMenuOpen}
              hasDivisions={hasDivisions}
              hasPhases={hasPhases}
              onCreateDivision={onCreateDivision}
              onGenerateBracket={onGenerateBracket}
              onCreatePhase={onCreatePhase}
              onCreateMatch={onCreateMatch}
            />
          )}
          {isSongsPage && (
            <TournamentHeaderSongsManageMenu
              tournamentId={tournamentId}
              songsVersion={songsVersion}
              refreshSongs={refreshSongs}
            />
          )}
          {isLobbiesPage && (
            <TournamentHeaderLobbyManageMenu
              tournamentId={tournamentId}
              syncstartUrl={syncstartUrl}
              setSyncstartUrl={setSyncstartUrl}
            />
          )}
          <ManageActionsMenu
            tournamentId={String(tournamentId)}
            canEditHelpers={helpersEnabled}
          />
        </div>
      )}
    </div>
  );
}
