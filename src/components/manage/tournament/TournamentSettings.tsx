import { useState, useEffect } from "react";
import DivisionList from "@/components/manage/tournament/DivisionList";
import PhaseList from "@/components/manage/tournament/PhaseList";
import axios from "axios";

type TournamentSettingsProps = {
  controls: boolean;
  tournamentId?: number;
  matchUpdateSignal?: number;
  headerActions?: React.ReactNode;
};

export default function TournamentSettings({
  controls,
  tournamentId,
  matchUpdateSignal,
  headerActions,
}: TournamentSettingsProps) {
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const [phaseListKey, setPhaseListKey] = useState(0);
  const [tournamentName, setTournamentName] = useState<string>("");

  useEffect(() => {
    if (!controls && tournamentId) {
      axios.get<{ id: number; name: string }>(`tournaments/${tournamentId}`)
        .then((r) => setTournamentName(r.data.name))
        .catch(() => {});
    }
  }, [tournamentId, controls]);

  return (
    <div className="flex flex-col gap-3">
      {!controls && tournamentName && (
        <h2 className="text-rossoTesto">History of {tournamentName}!</h2>
      )}

      <div className="flex flex-row justify-between items-start gap-3">
        <DivisionList
          controls={controls}
          tournamentId={tournamentId}
          onDivisionSelect={(division) => {
            setSelectedDivisionId(division?.id ?? null);
            setPhaseListKey((k) => k + 1);
          }}
        />
        {headerActions && (
          <div className="flex items-center gap-2 shrink-0">{headerActions}</div>
        )}
      </div>

      {selectedDivisionId && (
        <PhaseList
          key={phaseListKey}
          divisionId={selectedDivisionId}
          tournamentId={tournamentId}
          controls={controls}
          matchUpdateSignal={matchUpdateSignal}
        />
      )}
    </div>
  );
}
