import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Division } from "../../../models/Division";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateDivisionModal from "./modals/CreateDivisionModal";

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

  useEffect(() => {
    axios.get<Division[]>("divisions", { params: { tournamentId } }).then((response) => {
      setDivisions(response.data);
    });
  }, [tournamentId]);

  // Division functions
  const createDivision = (name: string, bracketType: string) => {
    axios.post<Division>("divisions", { tournamentId, name, bracketType }).then((response) => {
      setDivisions([...divisions, response.data]);
      setSelectedDivisionId(response.data.id);
    });
  };

  const deleteDivision = () => {
    // ask the user double confirmation because it's a dangerous action
    if (
      window.confirm("WARNING!! Are you sure you want to delete this division?")
    ) {
      if (
        window.confirm(
          "WARNING!! This action is irreversible. Are you really sure?",
        )
      ) {
        axios.delete(`divisions/${selectedDivisionId}`).then(() => {
          setDivisions(divisions.filter((d) => d.id !== selectedDivisionId));
          setSelectedDivisionId(-1);
        });
      }
    }
  };
  return (
    <div className="flex flex-row gap-3 text-black">
      <CreateDivisionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createDivision}
      />
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
            onClick={deleteDivision}
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
