import { useEffect, useState } from "react";
import { Phase } from "@/models/Phase";
import { Division } from "@/models/Division";
import Select from "react-select";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faDiagramProject } from "@fortawesome/free-solid-svg-icons";
import GenerateBracketModal from "@/components/manage/tournament/modals/GenerateBracketModal";
import CreatePhaseModal from "@/components/manage/tournament/modals/CreatePhaseModal";
import OkModal from "@/components/layout/OkModal";

type PhaseListProps = {
  divisionId: number;
  tournamentId?: number;
  controls?: boolean;
  onPhaseSelect: (phase: Phase | null) => void;
};

export default function PhaseList({
  divisionId,
  tournamentId,
  controls = false,
  onPhaseSelect,
}: PhaseListProps) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(-1);
  const [bracketTypes, setBracketTypes] = useState<string[]>([]);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [createPhaseModalOpen, setCreatePhaseModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    axios.get<Division>(`divisions/${divisionId}`)
      .then((response) => {
        const phases = response.data.phases;
        setPhases(phases);
        setError(null);
        if (phases.length > 0) {
          setSelectedPhaseId(phases[0].id);
          onPhaseSelect(phases[0]);
        }
      })
      .catch(() => setError("Failed to load phases."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisionId]);

  useEffect(() => {
    if (controls) {
      axios.get<string[]>("match-operations/bracket-types").then((r) => {
        setBracketTypes(r.data);
      });
    }
  }, [controls]);

  const handleCreatePhase = (name: string) => {
    axios.post<Phase>(`phases`, { divisionId, name }).then((response) => {
      setPhases([...phases, response.data]);
      setSelectedPhaseId(response.data.id);
      onPhaseSelect(response.data);
    });
  };

  const handleDeletePhase = () => {
    setDeleteConfirmOpen(false);
    axios.delete(`phases/${selectedPhaseId}`).then(() => {
      const remaining = phases.filter((d) => d.id !== selectedPhaseId);
      setPhases(remaining);
      setSelectedPhaseId(-1);
      onPhaseSelect(null);
    });
  };

  async function handleGenerateBracket(bracketType: string, playerPerMatch: number) {
    if (!tournamentId) return;
    await axios.post(`match-operations/divisions/${divisionId}/generate-bracket`, {
      bracketType,
      tournamentId,
      playerPerMatch,
    });
    const response = await axios.get<Division>(`divisions/${divisionId}`);
    const newPhases = response.data.phases;
    setPhases(newPhases);
    if (newPhases.length > 0) {
      setSelectedPhaseId(newPhases[0].id);
      onPhaseSelect(newPhases[0]);
    }
  }

  if (isLoading) return <p className="text-gray-400 mt-3">Loading phases...</p>;
  if (error) return <p className="text-red-500 mt-3">{error}</p>;

  return (
    <div className="flex flex-col gap-3 mt-3">
      <CreatePhaseModal
        open={createPhaseModalOpen}
        onClose={() => setCreatePhaseModalOpen(false)}
        onCreate={handleCreatePhase}
      />
      <OkModal
        title="Delete Phase"
        okText="Delete"
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onOk={handleDeletePhase}
      >
        Are you sure you want to delete this phase?
      </OkModal>

      <div className="flex flex-row gap-3 items-center">
        <Select
          className="min-w-[300px]"
          placeholder="Select phase"
          options={phases.map((p) => ({ value: p.id, label: p.name }))}
          onChange={(e) => {
            onPhaseSelect(phases.find((p) => p.id === e?.value) ?? null);
            setSelectedPhaseId(e?.value ?? -1);
          }}
          value={
            selectedPhaseId >= 0
              ? {
                  value: phases.find((d) => d.id === selectedPhaseId)?.id,
                  label: phases.find((d) => d.id === selectedPhaseId)?.name,
                }
              : null
          }
        />
        {controls && (
          <>
            <button
              onClick={() => setCreatePhaseModalOpen(true)}
              className="text-green-700"
              title="Create new phase"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-red-700 disabled:text-red-200"
              disabled={selectedPhaseId === -1}
              title={selectedPhaseId === -1 ? "Select a phase to delete" : "Delete phase"}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            {phases.length === 0 && tournamentId && bracketTypes.length > 0 && (
              <button
                onClick={() => setGenerateModalOpen(true)}
                className="text-rossoTesto flex items-center gap-1 text-sm"
                title="Generate bracket"
              >
                <FontAwesomeIcon icon={faDiagramProject} />
                Generate bracket
              </button>
            )}
          </>
        )}
      </div>

      {generateModalOpen && (
        <GenerateBracketModal
          open={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          bracketTypes={bracketTypes}
          onGenerate={handleGenerateBracket}
        />
      )}
    </div>
  );
}
