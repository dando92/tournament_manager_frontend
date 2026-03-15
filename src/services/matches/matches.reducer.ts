import { Match } from "@/models/Match";
import { MatchesActions } from "@/services/matches/matches.actions";

export type MatchesState = {
  matches: Match[];
};

export const initialState: MatchesState = {
  matches: [],
};

export function matchesReducer(state: MatchesState, action: MatchesActions) {
  const { type, payload } = action;

  switch (type) {
    case "onListMatches":
      return {
        ...state,
        matches: payload,
      };
    case "onCreateMatch":
      return {
        ...state,
        matches: [...state.matches, payload],
      };
    case "onEditMatchNotes":
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === payload[0] ? { ...match, notes: payload[1] } : match,
        ),
      };
    case "onDeleteMatch":
      return {
        ...state,
        matches: state.matches.filter((match) => match.id !== payload.id),
      };
    case "onAddSongToMatch":
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === payload.id ? payload : match,
        ),
      };
    case "onAddStandingToMatch":
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === payload.id ? payload : match,
        ),
      };
    case "onDeleteStandingFromMatch":
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === payload.id ? payload : match,
        ),
      };
    case "onEditStandingFromMatch":
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === payload.id ? payload : match,
        ),
      };
    default:
      return state;
  }
}
