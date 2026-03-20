import { useEffect, useRef, useState } from "react";
import { Phase } from "@/models/Phase";
import { Division } from "@/models/Division";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsisV, faDiagramProject } from "@fortawesome/free-solid-svg-icons";
import GenerateBracketModal from "@/components/modals/GenerateBracketModal";
import CreatePhaseModal from "@/components/modals/CreatePhaseModal";
import OkModal from "@/components/modals/OkModal";
import MatchList from "@/components/manage/tournament/MatchList";

type PhaseListProps = {
  divisionId: number;
  tournamentId?: number;
  controls?: boolean;
  matchUpdateSignal?: number;
};

export default function PhaseList({
  divisionId,
  tournamentId,
  controls = false,
  matchUpdateSignal,
}: PhaseListProps) {
  const [division, setDivision] = useState<Division | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [bracketTypes, setBracketTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [renamingPhaseId, setRenamingPhaseId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    axios.get<Division>(`divisions/${divisionId}`)
      .then((r) => {
        setDivision(r.data);
        const loaded = r.data.phases ?? [];
        setPhases(loaded);
        setActivePhaseId(loaded.length > 0 ? loaded[0].id : null);
        setError(null);
      })
      .catch(() => setError("Failed to load phases."))
      .finally(() => setIsLoading(false));
  }, [divisionId]);

  useEffect(() => {
    if (controls) {
      axios.get<string[]>("match-operations/bracket-types")
        .then((r) => setBracketTypes(r.data))
        .catch(() => {});
    }
  }, [controls]);

  useEffect(() => {
    if (renamingPhaseId !== null) renameInputRef.current?.focus();
  }, [renamingPhaseId]);

  const handleCreatePhase = (name: string) => {
    axios.post<Phase>("phases", { divisionId, name }).then((r) => {
      setPhases((prev) => [...prev, r.data]);
      setActivePhaseId(r.data.id);
    });
  };

  const handleDeletePhase = () => {
    setDeleteConfirmOpen(false);
    if (!activePhaseId) return;
    axios.delete(`phases/${activePhaseId}`).then(() => {
      setPhases((prev) => {
        const remaining = prev.filter((p) => p.id !== activePhaseId);
        setActivePhaseId(remaining.length > 0 ? remaining[0].id : null);
        return remaining;
      });
    });
  };

  const commitRename = async () => {
    const trimmed = renameValue.trim();
    const id = renamingPhaseId;
    setRenamingPhaseId(null);
    if (!id || !trimmed) return;
    try {
      await axios.patch(`phases/${id}`, { name: trimmed });
      setPhases((prev) => prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p)));
    } catch {
      // silently keep old name on error
    }
  };

  const handleGenerateBracket = async (bracketType: string, playerPerMatch: number) => {
    if (!tournamentId) return;
    await axios.post(`match-operations/divisions/${divisionId}/generate-bracket`, {
      bracketType,
      tournamentId,
      playerPerMatch,
    });
    const r = await axios.get<Division>(`divisions/${divisionId}`);
    const newPhases = r.data.phases ?? [];
    setPhases(newPhases);
    setActivePhaseId(newPhases.length > 0 ? newPhases[0].id : null);
  };

  if (isLoading) return <p className="text-gray-400 mt-3 text-sm">Loading phases...</p>;
  if (error) return <p className="text-red-500 mt-3 text-sm">{error}</p>;

  const activePhase = phases.find((p) => p.id === activePhaseId) ?? null;

  return (
    <div className="mt-4">
      <CreatePhaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
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
      {generateModalOpen && (
        <GenerateBracketModal
          open={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          bracketTypes={bracketTypes}
          onGenerate={handleGenerateBracket}
        />
      )}

      {/* Phase tab bar */}
      {(phases.length > 0 || controls) && (
        <div className="overflow-x-auto">
          <div className="flex items-end border-b border-gray-200 min-w-max">
            {phases.map((phase) => {
              const isActive = phase.id === activePhaseId;
              const isRenaming = renamingPhaseId === phase.id;
              return (
                <div
                  key={phase.id}
                  className={`relative flex items-center gap-1.5 px-4 py-2 cursor-pointer select-none text-sm border-b-2 transition-colors ${
                    isActive
                      ? "border-rossoTesto text-rossoTesto font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => { if (!isRenaming) setActivePhaseId(phase.id); }}
                >
                  {isRenaming ? (
                    <input
                      ref={renameInputRef}
                      className="border-b border-rossoTesto outline-none text-sm w-32 bg-transparent"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setRenamingPhaseId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span>{phase.name}</span>
                  )}

                  {/* ⋯ options menu on active tab */}
                  {isActive && controls && !isRenaming && (
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                        className="text-gray-400 hover:text-gray-600 px-0.5"
                        title="Phase options"
                      >
                        <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
                      </button>
                      {menuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                          <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded shadow-lg border border-gray-200 min-w-[130px]">
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                setMenuOpen(false);
                                setRenameValue(phase.name);
                                setRenamingPhaseId(phase.id);
                              }}
                            >
                              Rename
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                              onClick={() => { setMenuOpen(false); setDeleteConfirmOpen(true); }}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add phase button at the end of tabs */}
            {controls && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-3 py-2 text-sm text-green-700 hover:text-green-900 border-b-2 border-transparent"
                title="Add phase"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Generate bracket prompt when no phases exist */}
      {phases.length === 0 && controls && tournamentId && bracketTypes.length > 0 && (
        <button
          onClick={() => setGenerateModalOpen(true)}
          className="mt-3 text-rossoTesto flex items-center gap-1.5 text-sm"
        >
          <FontAwesomeIcon icon={faDiagramProject} />
          Generate bracket
        </button>
      )}

      {/* Matches for the active phase */}
      {activePhase && division && (
        <MatchList
          key={activePhase.id}
          phaseId={activePhase.id}
          division={division}
          controls={controls}
          tournamentId={tournamentId}
          matchUpdateSignal={matchUpdateSignal}
        />
      )}
    </div>
  );
}
