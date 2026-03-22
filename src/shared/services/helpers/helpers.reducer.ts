import { Account } from "@/features/player/types/Account";
import { HelpersActions } from "@/shared/services/helpers/helpers.actions";

export interface HelpersState {
  helpers: Account[];
  candidates: Account[];
}

export const initialState: HelpersState = {
  helpers: [],
  candidates: [],
};

export function helpersReducer(state: HelpersState, action: HelpersActions): HelpersState {
  switch (action.type) {
    case "onLoadHelpers":
      return {
        helpers: action.payload.helpers,
        candidates: action.payload.candidates,
      };
    case "onAddHelper":
      return {
        ...state,
        helpers: [...state.helpers, action.payload],
      };
    case "onRemoveHelper":
      return {
        ...state,
        helpers: state.helpers.filter((h) => h.id !== action.payload),
      };
    default:
      return state;
  }
}
