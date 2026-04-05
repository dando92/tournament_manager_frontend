import { HelperAccount } from "@/shared/services/helpers/types";

export type onLoadHelpers = {
  type: "onLoadHelpers";
  payload: { helpers: HelperAccount[]; candidates: HelperAccount[] };
};

export type onAddHelper = {
  type: "onAddHelper";
  payload: HelperAccount;
};

export type onRemoveHelper = {
  type: "onRemoveHelper";
  payload: string;
};

export type HelpersActions = onLoadHelpers | onAddHelper | onRemoveHelper;
