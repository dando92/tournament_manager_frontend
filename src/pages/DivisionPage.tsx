import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Division } from "@/features/division/types/Division";
import DivisionView from "@/features/division/components/DivisionView";
import { usePermissions } from "@/shared/services/permissions/PermissionContext";

export default function DivisionPage() {
  const { tournamentId: tidParam, divisionId: didParam } = useParams<{ tournamentId: string; divisionId: string }>();
  const tournamentId = Number(tidParam);
  const divisionId = Number(didParam);
  const navigate = useNavigate();

  const { canEditTournament } = usePermissions();
  const canControl = canEditTournament(tournamentId);

  const [division, setDivision] = useState<Division | null>(null);

  const fetchDivision = useCallback(() => {
    axios.get<Division>(`divisions/${divisionId}`)
      .then((r) => setDivision(r.data))
      .catch(() => {});
  }, [divisionId]);

  useEffect(() => {
    fetchDivision();
  }, [fetchDivision]);

  if (!division) return null;

  return (
    <DivisionView
      division={division}
      tournamentId={tournamentId}
      controls={canControl}
      onBack={() => navigate(`/tournament/${tournamentId}`)}
      onPlayersChanged={fetchDivision}
    />
  );
}
