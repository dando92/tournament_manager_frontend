import { createContext } from "react";

/**
 * Set of matchIds updated in the latest WebSocket flush.
 * A new Set reference is created on each flush so MatchCards detect the change.
 */
export const MatchUpdateContext = createContext<ReadonlySet<number>>(new Set());
