export type StartggImportMode = "create-division";

export type StartggImportPreviewRequest = {
  eventSlug: string;
  targetTournamentId?: number;
  mode?: StartggImportMode;
};

export type StartggImportEventSummary = {
  id: string;
  name: string;
  slug: string;
  tournament?: {
    id: string;
    name: string;
    slug?: string | null;
  } | null;
  phases: Array<{
    id: string;
    name: string;
  }>;
};

export type StartggImportPreviewParticipant = {
  externalId: string;
  gamerTag: string;
  action: string;
  localParticipantId: number | null;
  localPlayerId: number | null;
};

export type StartggImportPreviewEntrant = {
  externalId: string;
  name: string;
  type: "player" | "team";
  action: string;
  localEntrantId: number | null;
  participantExternalIds: string[];
};

export type StartggImportPreviewPhase = {
  externalId: string;
  name: string;
  type: "pool" | "bracket";
  action: string;
  localPhaseId: number | null;
};

export type StartggImportPreviewPhaseGroup = {
  externalId: string;
  phaseExternalId: string;
  name: string;
  mode: "set-driven" | "progression-driven";
  action: string;
  localPhaseGroupId: number | null;
};

export type StartggImportPreviewPhaseSeed = {
  externalId: string;
  phaseExternalId: string;
  entrantExternalId: string;
  seedNum: number;
};

export type StartggImportPreviewMatch = {
  externalId: string;
  name: string;
  action: string;
  localMatchId: number | null;
  phaseExternalId: string;
  entrantExternalIds: string[];
};

export type StartggImportPreviewResponse = {
  event: StartggImportEventSummary;
  targetTournamentId: number | null;
  mode: string;
  division: {
    externalId: string;
    name: string;
    action: string;
    localDivisionId: number | null;
  };
  counts: {
    participants: number;
    entrants: number;
    phases: number;
    phaseGroups: number;
    phaseSeeds: number;
    matches: number;
  };
  participants: StartggImportPreviewParticipant[];
  entrants: StartggImportPreviewEntrant[];
  phases: StartggImportPreviewPhase[];
  phaseGroups: StartggImportPreviewPhaseGroup[];
  phaseSeeds: StartggImportPreviewPhaseSeed[];
  matches: StartggImportPreviewMatch[];
};

export type StartggImportResponse = {
  tournamentId: number;
  divisionId: number;
  imported: {
    participants: number;
    entrants: number;
    phases: number;
    phaseGroups: number;
    phaseSeeds: number;
    matches: number;
  };
};
