import { useEffect, useState } from "react";
import OkModal from "../../../layout/OkModal";
import axios from "axios";
import Select from "react-select";

type CreateDivisionModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, bracketType: string) => void;
};

export default function CreateDivisionModal({
  open,
  onClose,
  onCreate,
}: CreateDivisionModalProps) {
  const [name, setName] = useState("");
  const [bracketTypes, setBracketTypes] = useState<string[]>([]);
  const [bracketType, setBracketType] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    axios.get<string[]>("match-operations/bracket-types").then((response) => {
      setBracketTypes(response.data);
      setBracketType(response.data[0] ?? "");
    });
  }, [open]);

  const onSubmit = () => {
    if (!name.trim() || !bracketType) return;
    onCreate(name.trim(), bracketType);
    onClose();
  };

  return (
    <OkModal
      title="Create Division"
      okText="Create division"
      open={open}
      onClose={onClose}
      onOk={onSubmit}
    >
      <div className="flex flex-col gap-4 w-full">
        <div>
          <h3 className="mb-1">Name</h3>
          <input
            className="w-full border border-gray-300 px-2 py-2 rounded-lg"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Division name"
            autoFocus
          />
        </div>
        <div>
          <h3 className="mb-1">Bracket type</h3>
          <Select
            options={bracketTypes.map((t) => ({ value: t, label: t }))}
            value={bracketType ? { value: bracketType, label: bracketType } : null}
            onChange={(selected) => setBracketType(selected?.value ?? "")}
            placeholder="Select bracket type..."
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>
      </div>
    </OkModal>
  );
}
