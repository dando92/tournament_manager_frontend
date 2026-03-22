import { useState, useEffect, useRef } from "react";
import { Division } from "@/models/Division";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsisV, faDiagramProject } from "@fortawesome/free-solid-svg-icons";
import CreateDivisionModal from "@/components/modals/CreateDivisionModal";
import GenerateBracketModal from "@/components/modals/GenerateBracketModal";
import OkModal from "@/components/modals/OkModal";
import MatchList from "@/components/manage/tournament/MatchList";

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
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [activeDivisionId, setActiveDivisionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentName, setTournamentName] = useState<string>("");

  const [bracketTypes, setBracketTypes] = useState<string[]>([]);
  const [createDivisionModalOpen, setCreateDivisionModalOpen] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<0 | 1 | 2>(0);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renamingDivisionId, setRenamingDivisionId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!controls && tournamentId) {
      axios.get<{ id: number; name: string }>(`tournaments/${tournamentId}`)
        .then((r) => setTournamentName(r.data.name))
        .catch(() => {});
    }
  }, [tournamentId, controls]);

  useEffect(() => {
    if (controls) {
      axios.get<string[]>("match-operations/bracket-types")
        .then((r) => setBracketTypes(r.data))
        .catch(() => {});
    }
  }, [controls]);

  useEffect(() => {
    if (!tournamentId) return;
    setIsLoading(true);
    axios.get<Division[]>("divisions", { params: { tournamentId } })
      .then((r) => {
        setDivisions(r.data);
        setActiveDivisionId(r.data.length > 0 ? r.data[0].id : null);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [tournamentId]);

  useEffect(() => {
    if (renamingDivisionId !== null) renameInputRef.current?.focus();
  }, [renamingDivisionId]);

  const handleCreateDivision = (name: string) => {
    axios.post<Division>("divisions", { tournamentId, name }).then((r) => {
      setDivisions((prev) => [...prev, r.data]);
      setActiveDivisionId(r.data.id);
    });
  };

  const handleDeleteDivision = () => {
    setDeleteConfirmStep(0);
    if (!activeDivisionId) return;
    axios.delete(`divisions/${activeDivisionId}`).then(() => {
      setDivisions((prev) => {
        const remaining = prev.filter((d) => d.id !== activeDivisionId);
        setActiveDivisionId(remaining.length > 0 ? remaining[0].id : null);
        return remaining;
      });
    });
  };

  const commitRename = async () => {
    const trimmed = renameValue.trim();
    const id = renamingDivisionId;
    setRenamingDivisionId(null);
    if (!id || !trimmed) return;
    try {
      await axios.patch(`divisions/${id}`, { name: trimmed });
      setDivisions((prev) => prev.map((d) => (d.id === id ? { ...d, name: trimmed } : d)));
    } catch {
      // silently keep old name on error
    }
  };

  const handleGenerateBracket = async (bracketType: string, playerPerMatch: number) => {
    if (!tournamentId || !activeDivisionId) return;
    await axios.post(`match-operations/divisions/${activeDivisionId}/generate-bracket`, {
      bracketType,
      tournamentId,
      playerPerMatch,
    });
    const r = await axios.get<Division[]>("divisions", { params: { tournamentId } });
    setDivisions(r.data);
  };

  const activeDivision = divisions.find((d) => d.id === activeDivisionId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      {!controls && tournamentName && (
        <h2 className="text-rossoTesto">History of {tournamentName}!</h2>
      )}

      <CreateDivisionModal
        open={createDivisionModalOpen}
        onClose={() => setCreateDivisionModalOpen(false)}
        onCreate={handleCreateDivision}
      />
      <OkModal
        title="Delete Division"
        okText="Yes, continue"
        open={deleteConfirmStep === 1}
        onClose={() => setDeleteConfirmStep(0)}
        onOk={() => setDeleteConfirmStep(2)}
      >
        WARNING!! Are you sure you want to delete this division?
      </OkModal>
      <OkModal
        title="Delete Division — Final Confirmation"
        okText="Delete permanently"
        open={deleteConfirmStep === 2}
        onClose={() => setDeleteConfirmStep(0)}
        onOk={handleDeleteDivision}
      >
        WARNING!! This action is irreversible. Are you really sure?
      </OkModal>
      {generateModalOpen && (
        <GenerateBracketModal
          open={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          bracketTypes={bracketTypes}
          onGenerate={handleGenerateBracket}
        />
      )}

      {/* Division tab bar */}
      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading divisions...</p>
      ) : (
        <div className="flex items-center gap-3">
          <div className="overflow-x-auto flex-1">
          <div className="flex items-end border-b border-gray-200 min-w-max">
              {divisions.map((division) => {
                const isActive = division.id === activeDivisionId;
                const isRenaming = renamingDivisionId === division.id;
                return (
                  <div
                    key={division.id}
                    className={`relative flex items-center gap-1.5 px-4 py-2 cursor-pointer select-none text-sm border-b-2 transition-colors ${
                      isActive
                        ? "border-rossoTesto text-rossoTesto font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => { if (!isRenaming) setActiveDivisionId(division.id); }}
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
                          if (e.key === "Escape") setRenamingDivisionId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span>{division.name}</span>
                    )}

                    {/* ⋯ options menu on active tab */}
                    {isActive && controls && !isRenaming && (
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                          className="text-gray-400 hover:text-gray-600 px-0.5"
                          title="Division options"
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
                                  setRenameValue(division.name);
                                  setRenamingDivisionId(division.id);
                                }}
                              >
                                Rename
                              </button>
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                                onClick={() => { setMenuOpen(false); setDeleteConfirmStep(1); }}
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

              {controls && (
                <button
                  onClick={() => setCreateDivisionModalOpen(true)}
                  className="px-3 py-2 text-sm text-green-700 hover:text-green-900 border-b-2 border-transparent"
                  title="Add division"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              )}
          </div>
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 shrink-0 pb-px">{headerActions}</div>
          )}
        </div>
      )}

      {/* Generate bracket prompt when no matches exist */}
      {activeDivision && controls && tournamentId &&
        activeDivision.matches?.length === 0 && (
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="mt-1 text-rossoTesto flex items-center gap-1.5 text-sm"
          >
            <FontAwesomeIcon icon={faDiagramProject} />
            Generate bracket
          </button>
        )}

      {activeDivision && (
        <MatchList
          key={activeDivision.id}
          division={activeDivision}
          controls={controls}
          tournamentId={tournamentId}
          matchUpdateSignal={matchUpdateSignal}
        />
      )}
    </div>
  );
}
