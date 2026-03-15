import { useState, useEffect } from "react";
import { Division } from "../../../models/Division";
import DivisionList from "./DivisionList";
import { Phase } from "../../../models/Phase";
import PhaseList from "./PhaseList";
import MatchesView from "./MatchesView";
import axios from "axios";

type TournamentSettingsProps = {
  controls: boolean;
  tournamentId?: number;
  matchUpdateSignal?: number;
};

export default function TournamentSettings({
  controls,
  tournamentId,
  matchUpdateSignal,
}: TournamentSettingsProps) {
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [tournamentName, setTournamentName] = useState<string>("");
  const [phaseListKey, setPhaseListKey] = useState(0);

  useEffect(() => {
    if (!controls && tournamentId) {
      axios.get<{ id: number; name: string }>(`tournaments/${tournamentId}`)
        .then(r => setTournamentName(r.data.name))
        .catch(() => {});
    }
  }, [tournamentId, controls]);

  return (
    <>
      <div className="flex flex-col justify-start gap-3">
        {!controls && tournamentName && (
          <div className="flex flex-row gap-3">
            <h2 className="text-rossoTesto">
              History of {tournamentName}!
            </h2>
          </div>
        )}

        <div className="flex flex-row justify-between gap-3">
          <div>
            <DivisionList
              controls={controls}
              tournamentId={tournamentId}
              onDivisionSelect={(division) => {
                setSelectedDivision(division);
                setSelectedPhase(null);
                setPhaseListKey(k => k + 1);
              }}
            />
            {selectedDivision && (
              <PhaseList
                key={phaseListKey}
                controls={controls}
                onPhaseSelect={setSelectedPhase}
                divisionId={selectedDivision.id}
                tournamentId={tournamentId}
              />
            )}
          </div>
        </div>
        {selectedPhase && selectedDivision && (
          <MatchesView
            controls={controls}
            division={selectedDivision}
            phaseId={selectedPhase.id}
            tournamentId={tournamentId}
            matchUpdateSignal={matchUpdateSignal}
          />
        )}
      </div>
    </>
  );
}
