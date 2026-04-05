import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTournamentHeaderSubtitle } from "@/features/tournament/components/header/tournamentHeaderSubtitle";
import { TournamentPageContextValue } from "@/features/tournament/context/TournamentPageContext";
import { TournamentPageState } from "@/features/tournament/hooks/useTournamentPage";
import { CreateMatchRequest } from "@/features/match/types/match-requests";

type UseTournamentLayoutOptions = {
  context: TournamentPageContextValue;
  state: TournamentPageState;
};

export function useTournamentLayout({ context, state }: UseTournamentLayoutOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId } = context;
  const { generateBracketDivisionId } = state;

  const routeState = useMemo(() => {
    const overviewPath = `/tournament/${tournamentId}/overview`;
    const lobbiesPath = `/tournament/${tournamentId}/lobbies`;
    const songsPath = `/tournament/${tournamentId}/songs`;

    return {
      isOverviewPage: location.pathname === overviewPath,
      isLobbiesPage: location.pathname === lobbiesPath,
      isSongsPage: location.pathname === songsPath,
      headerSubtitle: getTournamentHeaderSubtitle(location.pathname, tournamentId),
    };
  }, [location.pathname, tournamentId]);

  const handleCreatePhase = useCallback(
    async (name: string, divisionId: number) => {
      await state.handleCreatePhase(name, divisionId);
      navigate(`/tournament/${tournamentId}/division/${divisionId}/phases?refresh=${Date.now()}`);
    },
    [navigate, state, tournamentId],
  );

  const handleCreateMatch = useCallback(
    async (request: CreateMatchRequest) => {
      await state.handleCreateMatch(request);
      if (request.divisionId) {
        navigate(
          `/tournament/${tournamentId}/division/${request.divisionId}/phases?refresh=${Date.now()}`,
        );
      }
    },
    [navigate, state, tournamentId],
  );

  const handleGenerateBracket = useCallback(
    async (bracketType: string, playerPerMatch: number) => {
      await state.handleGenerateBracket(bracketType, playerPerMatch);
      if (generateBracketDivisionId) {
        navigate(`/tournament/${tournamentId}/division/${generateBracketDivisionId}/phases`);
      }
    },
    [generateBracketDivisionId, navigate, state, tournamentId],
  );

  return {
    ...routeState,
    handleCreatePhase,
    handleCreateMatch,
    handleGenerateBracket,
  };
}
