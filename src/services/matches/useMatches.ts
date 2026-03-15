import { useReducer } from "react";
import { initialState, matchesReducer } from "./matches.reducer";
import * as MatchesApi from "./matches.api";
import { CreateMatchRequest } from "../../models/requests/match-requests";
import { toast } from "react-toastify";

export function useMatches(phaseId: number) {
  const [state, dispatch] = useReducer(matchesReducer, initialState);

  async function list() {
    try {
      const items = await MatchesApi.listByPhase(phaseId);
      dispatch({ type: "onListMatches", payload: items });
    } catch (error) {
      console.error("Error listing matches by phase:", error);
      toast.error("Error listing matches by phase.");
      throw new Error("Unable to list matches by phase.");
    }
  }

  async function create(request: CreateMatchRequest) {
    try {
      const item = await MatchesApi.create(request);
      dispatch({ type: "onCreateMatch", payload: item });
      toast.success("Match created successfully.");
    } catch (error) {
      toast.error("Error creating match.");
      console.error("Error creating match:", error);
      throw new Error("Unable to create match.");
    }
  }

  async function editMatchNotes(matchId: number, notes: string) {
    try {
      await MatchesApi.editMatchNotes(matchId, notes);
      dispatch({ type: "onEditMatchNotes", payload: [matchId, notes] });
    } catch (error) {
      toast.error("Error editing match notes.");
      console.error("Error editing match notes:", error);
      throw new Error("Unable to edit match notes.");
    }
  }

  async function deleteMatch(matchId: number) {
    try {
      await MatchesApi.deleteMatch(matchId);
      dispatch({
        type: "onDeleteMatch",
        payload: state.matches.find((m) => m.id === matchId)!,
      });
    } catch (error) {
      toast.error("Error deleting match.");
      console.error("Error deleting match:", error);
      throw new Error("Unable to delete match.");
    }
  }

  async function addSongToMatchByRoll(
    matchId: number,
    divisionId: number,
    group: string,
    level: string,
  ) {
    try {
      const item = await MatchesApi.addSongToMatch(matchId, undefined, divisionId, group, level);
      dispatch({ type: "onAddSongToMatch", payload: item });
    } catch (error) {
      toast.error("Error adding song to match.");
      console.error("Error adding song to match:", error);
      throw new Error("Unable to add song to match.");
    }
  }

  async function editSongToMatchByRoll(
    matchId: number,
    editSongId: number,
    divisionId: number,
    group: string,
    level: string,
  ) {
    try {
      const item = await MatchesApi.editSongInMatch(matchId, editSongId, undefined, divisionId, group, level);
      dispatch({ type: "onAddSongToMatch", payload: item });
    } catch (error) {
      toast.error("Error editing song in match.");
      console.error("Error editing song in match:", error);
      throw new Error("Unable to edit song in match.");
    }
  }

  async function addSongToMatchBySongId(
    matchId: number,
    songId: number,
  ) {
    try {
      const item = await MatchesApi.addSongToMatch(matchId, songId);
      dispatch({ type: "onAddSongToMatch", payload: item });
    } catch (error) {
      toast.error("Error adding song to match.");
      console.error("Error adding song to match:", error);
      throw new Error("Unable to add song to match.");
    }
  }

  async function editSongToMatchBySongId(
    matchId: number,
    editSongId: number,
    songId: number,
  ) {
    try {
      const item = await MatchesApi.editSongInMatch(matchId, editSongId, songId);
      dispatch({ type: "onAddSongToMatch", payload: item });
    } catch (error) {
      toast.error("Error editing song in match.");
      console.error("Error editing song in match:", error);
      throw new Error("Unable to edit song in match.");
    }
  }

  async function addStandingToMatch(
    matchId: number,
    playerId: number,
    songId: number,
    percentage: number,
    score: number,
    isFailed: boolean,
  ) {
    try {
      const item = await MatchesApi.addStandingToMatch(matchId, {
        playerId,
        songId,
        percentage,
        score,
        isFailed,
      });
      dispatch({ type: "onAddStandingToMatch", payload: item });
    } catch (error) {
      toast.error("Error adding standing to match.");
      console.error("Error adding standing to match:", error);
      throw new Error("Unable to add standing to match.");
    }
  }

  async function deleteStandingsForPlayerFromMatch(
    matchId: number,
    playerId: number,
    songId: number,
  ) {
    try {
      const item = await MatchesApi.deleteStandingFromMatch(matchId, playerId, songId);
      dispatch({ type: "onDeleteStandingFromMatch", payload: item });
    } catch (error) {
      toast.error("Error deleting standings for player from match.");
      console.error("Error deleting standings for player from match:", error);
      throw new Error("Unable to delete standings for player from match.");
    }
  }

  async function editStandingFromMatch(
    matchId: number,
    songId: number,
    playerId: number,
    percentage: number,
    score: number,
    isFailed: boolean,
  ) {
    try {
      const item = await MatchesApi.editStandingInMatch(
        matchId,
        songId,
        playerId,
        percentage,
        score,
        isFailed,
      );
      dispatch({ type: "onEditStandingFromMatch", payload: item });
    } catch (error) {
      toast.error("Error editing standings for player from match.");
      console.error("Error editing standings for player from match:", error);
      throw new Error("Unable to edit standings for player from match.");
    }
  }

  return {
    state,
    actions: {
      list,
      create,
      editMatchNotes,
      deleteMatch,
      addSongToMatchByRoll,
      addSongToMatchBySongId,
      editSongToMatchByRoll,
      editSongToMatchBySongId,
      addStandingToMatch,
      editStandingFromMatch,
      deleteStandingsForPlayerFromMatch,
    },
  };
}
