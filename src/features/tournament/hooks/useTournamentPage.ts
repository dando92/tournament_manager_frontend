import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Tournament } from "@/features/tournament/types/Tournament";
import { Division } from "@/features/division/types/Division";
import { addRecentTournament } from "@/features/tournament/services/recentTournaments";
import { useTournamentUpdates } from "@/features/tournament/context/TournamentUpdatesContext";
import * as MatchesApi from "@/features/match/services/matches.api";
import { CreateMatchRequest } from "@/features/match/types/match-requests";

type UseTournamentPageOptions = {
  tournamentId: number;
  canControl: boolean;
};

export type TournamentPageState = {
  divisions: Division[];
  tournamentName: string;
  syncstartUrl: string;
  createDivisionOpen: boolean;
  selectDivisionOpen: boolean;
  createPhaseOpen: boolean;
  createMatchOpen: boolean;
  generateBracketDivisionId: number | null;
  bracketTypes: string[];
  createMenuOpen: boolean;
  setCreateDivisionOpen: Dispatch<SetStateAction<boolean>>;
  setSelectDivisionOpen: Dispatch<SetStateAction<boolean>>;
  setCreatePhaseOpen: Dispatch<SetStateAction<boolean>>;
  setCreateMatchOpen: Dispatch<SetStateAction<boolean>>;
  setGenerateBracketDivisionId: Dispatch<SetStateAction<number | null>>;
  setCreateMenuOpen: Dispatch<SetStateAction<boolean>>;
  setSyncstartUrl: Dispatch<SetStateAction<string>>;
  refreshDivisions: () => Promise<void>;
  handleCreateDivision: (name: string) => void;
  handleCreatePhase: (name: string, divisionId: number) => Promise<void>;
  handleCreateMatch: (request: CreateMatchRequest) => Promise<void>;
  handleGenerateBracket: (bracketType: string, playerPerMatch: number) => Promise<void>;
};

export function useTournamentPage({
  tournamentId,
  canControl,
}: UseTournamentPageOptions): TournamentPageState {
  const { tournamentVersion } = useTournamentUpdates();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [syncstartUrl, setSyncstartUrl] = useState("");
  const [createDivisionOpen, setCreateDivisionOpen] = useState(false);
  const [selectDivisionOpen, setSelectDivisionOpen] = useState(false);
  const [createPhaseOpen, setCreatePhaseOpen] = useState(false);
  const [createMatchOpen, setCreateMatchOpen] = useState(false);
  const [generateBracketDivisionId, setGenerateBracketDivisionId] = useState<number | null>(null);
  const [bracketTypes, setBracketTypes] = useState<string[]>([]);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const refreshDivisions = useCallback(async () => {
    const response = await axios.get<Division[]>("divisions", { params: { tournamentId } });
    setDivisions(response.data);
  }, [tournamentId]);

  useEffect(() => {
    axios
      .get<Tournament>(`tournaments/${tournamentId}`)
      .then((r) => {
        addRecentTournament({ id: r.data.id, name: r.data.name });
        setTournamentName(r.data.name);
        setSyncstartUrl(r.data.syncstartUrl ?? "");
        document.title = `${r.data.name} - Tournament Manager`;
      })
      .catch(() => {});

    refreshDivisions().catch(() => {});
    return () => {
      document.title = "Tournament Manager";
    };
  }, [refreshDivisions, tournamentId]);

  useEffect(() => {
    if (!canControl) return;
    axios.get<string[]>("bracket/bracket-types")
      .then((r) => setBracketTypes(r.data))
      .catch(() => {});
  }, [canControl]);

  useEffect(() => {
    if (tournamentVersion === 0) return;
    refreshDivisions().catch(() => {});
  }, [refreshDivisions, tournamentVersion]);

  const handleGenerateBracket = useCallback(async (bracketType: string, playerPerMatch: number) => {
    if (!generateBracketDivisionId) return;
    await axios.post(`bracket/divisions/${generateBracketDivisionId}/generate-bracket`, {
      bracketType,
      tournamentId,
      playerPerMatch,
    });
    await refreshDivisions();
    setGenerateBracketDivisionId(null);
  }, [generateBracketDivisionId, refreshDivisions, tournamentId]);

  const handleCreateDivision = useCallback((name: string) => {
    axios.post<Division>("divisions", { tournamentId, name })
      .then((r) => {
        setDivisions((prev) => [...prev, r.data]);
      })
      .catch(() => {});
  }, [tournamentId]);

  const handleCreatePhase = useCallback(async (name: string, divisionId: number) => {
    await axios.post("phases", { name, divisionId });
    await refreshDivisions();
  }, [refreshDivisions]);

  const handleCreateMatch = useCallback(async (request: CreateMatchRequest) => {
    await MatchesApi.create(request);
    await refreshDivisions();
  }, [refreshDivisions]);

  return {
    divisions,
    tournamentName,
    syncstartUrl,
    createDivisionOpen,
    selectDivisionOpen,
    createPhaseOpen,
    createMatchOpen,
    generateBracketDivisionId,
    bracketTypes,
    createMenuOpen,
    setCreateDivisionOpen,
    setSelectDivisionOpen,
    setCreatePhaseOpen,
    setCreateMatchOpen,
    setGenerateBracketDivisionId,
    setCreateMenuOpen,
    setSyncstartUrl,
    refreshDivisions,
    handleCreateDivision,
    handleCreatePhase,
    handleCreateMatch,
    handleGenerateBracket,
  };
}
