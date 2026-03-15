import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Division } from "@/models/Division";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateDivisionModal from "@/components/manage/tournament/modals/CreateDivisionModal";
import OkModal from "@/components/layout/OkModal";

type DivisionListProps = {
  onDivisionSelect: (division: Division | null) => void;
  controls?: boolean;
  tournamentId?: number;
};

export default function DivisionList({
  onDivisionSelect,
  controls = false,
  tournamentId = 1,
}: DivisionListProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState<number>(-1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    axios.get<Division[]>("divisions", { params: { tournamentId } })
      .then((response) => { setDivisions(response.data); setError(null); })
      .catch(() => setError("Failed to load divisions."))
      .finally(() => setIsLoading(false));
  }, [tournamentId]);

  const createDivision = (name: string, bracketType: string) => {
    axios.post<Division>("divisions", { tournamentId, name, bracketType }).then((response) => {
      setDivisions([...divisions, response.data]);
      setSelectedDivisionId(response.data.id);
    });
  };

  const handleDeleteConfirmed = () => {
    setDeleteStep(0);
    axios.delete(`divisions/${selectedDivisionId}`).then(() => {
      setDivisions(divisions.filter((d) => d.id !== selectedDivisionId));
      setSelectedDivisionId(-1);
      onDivisionSelect(null);
    });
  };

  if (isLoading) return <p className="text-gray-400">Loading divisions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-row gap-3 text-black">
      <CreateDivisionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createDivision}
      />
      {/* Step 1: first confirmation */}
      <OkModal
        title="Delete Division"
        okText="Yes, continue"
        open={deleteStep === 1}
        onClose={() => setDeleteStep(0)}
        onOk={() => setDeleteStep(2)}
      >
        WARNING!! Are you sure you want to delete this division?
      </OkModal>
      {/* Step 2: second confirmation */}
      <OkModal
        title="Delete Division — Final Confirmation"
        okText="Delete permanently"
        open={deleteStep === 2}
        onClose={() => setDeleteStep(0)}
        onOk={handleDeleteConfirmed}
      >
        WARNING!! This action is irreversible. Are you really sure?
      </OkModal>

      <Select
        className="min-w-[300px]"
        placeholder="Select division"
        options={divisions.map((d) => ({ value: d.id, label: d.name }))}
        onChange={(e) => {
          onDivisionSelect(divisions.find((d) => d.id === e?.value) ?? null);
          setSelectedDivisionId(e?.value ?? -1);
        }}
        value={
          selectedDivisionId >= 0
            ? {
                value: divisions.find((d) => d.id === selectedDivisionId)?.id,
                label: divisions.find((d) => d.id === selectedDivisionId)?.name,
              }
            : null
        }
      />
      {controls && (
        <>
          <button
            onClick={() => setModalOpen(true)}
            className="text-green-700"
            title="Create new division"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button
            onClick={() => setDeleteStep(1)}
            className="text-red-700 disabled:text-red-200"
            disabled={selectedDivisionId === -1}
            title={
              selectedDivisionId === -1
                ? "plz select division to delete"
                : "Delete division"
            }
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      )}
    </div>
  );
}
