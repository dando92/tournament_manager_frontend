import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Tournament } from "@/features/tournament/types/Tournament";
import { Division } from "@/features/division/types/Division";
import { ActiveLobbyDto } from "@/features/live/services/useScoreHub";
import { addRecentTournament } from "@/features/tournament/services/recentTournaments";

type UseTournamentPageOptions = {
  tournamentId: number;
  canControl: boolean;
};

export type TournamentPageState = {
  initialActiveLobbies: ActiveLobbyDto[];
  divisions: Division[];
  tournamentName: string;
  createDivisionOpen: boolean;
  selectDivisionOpen: boolean;
  generateBracketDivisionId: number | null;
  bracketTypes: string[];
  createMenuOpen: boolean;
  setCreateDivisionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectDivisionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setGenerateBracketDivisionId: React.Dispatch<React.SetStateAction<number | null>>;
  setCreateMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshDivisions: () => Promise<void>;
  handleCreateDivision: (name: string) => void;
  handleGenerateBracket: (bracketType: string, playerPerMatch: number) => Promise<void>;
};

export function useTournamentPage({
  tournamentId,
  canControl,
}: UseTournamentPageOptions): TournamentPageState {
  const [initialActiveLobbies, setInitialActiveLobbies] = useState<ActiveLobbyDto[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [createDivisionOpen, setCreateDivisionOpen] = useState(false);
  const [selectDivisionOpen, setSelectDivisionOpen] = useState(false);
  const [generateBracketDivisionId, setGenerateBracketDivisionId] = useState<number | null>(null);
  const [bracketTypes, setBracketTypes] = useState<string[]>([]);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const fetchedLobbies = useRef(false);

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
        document.title = `${r.data.name} - Tournament Manager`;
      })
      .catch(() => {});

    refreshDivisions().catch(() => {});

    if (!fetchedLobbies.current) {
      fetchedLobbies.current = true;
      axios
        .get<{ id: string; name: string; lobbyCode: string; isActive: boolean; isConnected: boolean }[]>(`tournaments/${tournamentId}/lobbies/status`)
        .then((r) => {
          const active = r.data
            .filter((l) => l.isActive && l.isConnected)
            .map((l) => ({ tournamentId, lobbyId: l.id, lobbyName: l.name, lobbyCode: l.lobbyCode }));
          setInitialActiveLobbies(active);
        })
        .catch(() => {});
    }

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

  return {
    initialActiveLobbies,
    divisions,
    tournamentName,
    createDivisionOpen,
    selectDivisionOpen,
    generateBracketDivisionId,
    bracketTypes,
    createMenuOpen,
    setCreateDivisionOpen,
    setSelectDivisionOpen,
    setGenerateBracketDivisionId,
    setCreateMenuOpen,
    refreshDivisions,
    handleCreateDivision,
    handleGenerateBracket,
  };
}
