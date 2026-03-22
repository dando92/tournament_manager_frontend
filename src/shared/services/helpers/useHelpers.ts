import { useReducer } from "react";
import { helpersReducer, initialState } from "@/shared/services/helpers/helpers.reducer";
import * as HelpersApi from "@/shared/services/helpers/helpers.api";
import { toast } from "react-toastify";

export function useHelpers(tournamentId: number) {
  const [state, dispatch] = useReducer(helpersReducer, initialState);

  async function load() {
    try {
      const helpers = await HelpersApi.fetchHelpers(tournamentId);
      let candidates: Awaited<ReturnType<typeof HelpersApi.fetchHelperCandidates>> = [];
      try {
        candidates = await HelpersApi.fetchHelperCandidates();
      } catch {
        // User lacks permission to list candidates (e.g. helper role) — show list read-only
      }
      dispatch({ type: "onLoadHelpers", payload: { helpers, candidates } });
    } catch (error) {
      console.error("Error loading helpers:", error);
      toast.error("Error loading helpers.");
    }
  }

  async function addHelper(accountId: string) {
    try {
      await HelpersApi.addHelper(tournamentId, accountId);
      const candidate = state.candidates.find((c) => c.id === accountId);
      if (candidate) dispatch({ type: "onAddHelper", payload: candidate });
      toast.success("Helper added.");
    } catch (error) {
      console.error("Error adding helper:", error);
      toast.error("Error adding helper.");
    }
  }

  async function removeHelper(accountId: string) {
    try {
      await HelpersApi.removeHelper(tournamentId, accountId);
      dispatch({ type: "onRemoveHelper", payload: accountId });
      toast.success("Helper removed.");
    } catch (error) {
      console.error("Error removing helper:", error);
      toast.error("Error removing helper.");
    }
  }

  return {
    state,
    actions: { load, addHelper, removeHelper },
  };
}
