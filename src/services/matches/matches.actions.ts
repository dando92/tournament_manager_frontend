import { Match } from "@/models/Match";

type onListMatches = {
  type: "onListMatches";
  payload: Match[];
};

type onCreateMatch = {
  type: "onCreateMatch";
  payload: Match;
};

type onEditMatchNotes = {
  type: "onEditMatchNotes";
  payload: [number, string];
};

type onDeleteMatch = {
  type: "onDeleteMatch";
  payload: Match;
};

type onAddSongToMatch = {
  type: "onAddSongToMatch";
  payload: Match;
};

type onAddStandingToMatch = {
  type: "onAddStandingToMatch";
  payload: Match;
};

type onEditStandingFromMatch = {
  type: "onEditStandingFromMatch";
  payload: Match;
};

type onDeleteStandingFromMatch = {
  type: "onDeleteStandingFromMatch";
  payload: Match;
};

export type MatchesActions =
  | onListMatches
  | onCreateMatch
  | onEditMatchNotes
  | onDeleteMatch
  | onAddSongToMatch
  | onAddStandingToMatch
  | onEditStandingFromMatch
  | onDeleteStandingFromMatch;
