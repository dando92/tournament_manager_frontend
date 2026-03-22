import { Account } from "@/features/player/types/Account";

export type onLoadHelpers = {
  type: "onLoadHelpers";
  payload: { helpers: Account[]; candidates: Account[] };
};

export type onAddHelper = {
  type: "onAddHelper";
  payload: Account;
};

export type onRemoveHelper = {
  type: "onRemoveHelper";
  payload: string;
};

export type HelpersActions = onLoadHelpers | onAddHelper | onRemoveHelper;
