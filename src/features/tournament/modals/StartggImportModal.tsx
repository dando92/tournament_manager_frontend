import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import BaseModal from "@/shared/components/ui/BaseModal";
import { btnPrimary, btnSecondary } from "@/styles/buttonStyles";
import { Tournament } from "@/features/tournament/types/Tournament";
import { usePermissions } from "@/shared/services/permissions/PermissionContext";
import {
  importStartggEvent,
  importTournamentStartggEvent,
  previewStartggImport,
  previewTournamentStartggImport,
} from "@/features/tournament/services/startgg.api";
import { StartggImportPreviewResponse } from "@/features/tournament/types/StartggImport";

type Props = {
  open: boolean;
  onClose: () => void;
  fixedTournamentId?: number;
  fixedTournamentName?: string;
  onImported?: (result: { tournamentId: number; divisionId: number }) => Promise<void> | void;
};

const ACTION_LABELS: Record<string, string> = {
  mapped: "Mapped",
  "match-existing-participant": "Match existing participant",
  "create-participant": "Create participant",
  "create-player-and-participant": "Create player + participant",
  "match-existing-entrant": "Match existing entrant",
  "create-entrant": "Create entrant",
  "create-team-entrant": "Create team entrant",
  "create-phase": "Create phase",
  "create-match": "Create match",
  "create-division": "Create division",
  "unscoped-preview": "Preview only",
};

function formatAction(action: string) {
  return ACTION_LABELS[action] ?? action;
}

function ActionBadge({ action }: { action: string }) {
  const palette =
    action === "mapped" || action.startsWith("match-")
      ? "bg-emerald-100 text-emerald-800"
      : action.startsWith("create")
        ? "bg-blue-100 text-blue-800"
        : action.includes("blocked")
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${palette}`}>
      {formatAction(action)}
    </span>
  );
}

export default function StartggImportModal({
  open,
  onClose,
  fixedTournamentId,
  fixedTournamentName,
  onImported,
}: Props) {
  const { canEditTournament, isAdmin } = usePermissions();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [eventSlug, setEventSlug] = useState("");
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | "">("");
  const [preview, setPreview] = useState<StartggImportPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setPreview(null);
      setEventSlug("");
      setSelectedTournamentId(fixedTournamentId ?? "");
      return;
    }

    setSelectedTournamentId(fixedTournamentId ?? "");

    if (!fixedTournamentId) {
      axios.get<Tournament[]>("tournaments/public")
        .then((response) => setTournaments(response.data))
        .catch(() => {
          setTournaments([]);
        });
    }
  }, [fixedTournamentId, open]);

  useEffect(() => {
    setPreview(null);
  }, [eventSlug, selectedTournamentId]);

  const availableTournaments = useMemo(
    () => tournaments.filter((tournament) => isAdmin || canEditTournament(tournament.id)),
    [canEditTournament, isAdmin, tournaments],
  );

  const resolvedTournamentId = fixedTournamentId ?? (selectedTournamentId === "" ? null : Number(selectedTournamentId));

  async function handlePreview() {
    if (!eventSlug.trim()) return;

    setLoadingPreview(true);
    try {
      const response = resolvedTournamentId
        ? await previewTournamentStartggImport(resolvedTournamentId, { eventSlug: eventSlug.trim(), mode: "create-division" })
        : await previewStartggImport({ eventSlug: eventSlug.trim(), mode: "create-division" });
      setPreview(response);
    } catch {
      toast.error("Failed to preview start.gg import.");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleImport() {
    if (!eventSlug.trim() || !resolvedTournamentId) return;

    setSubmitting(true);
    try {
      const response = fixedTournamentId
        ? await importTournamentStartggEvent(fixedTournamentId, { eventSlug: eventSlug.trim(), mode: "create-division" })
        : await importStartggEvent({
            eventSlug: eventSlug.trim(),
            targetTournamentId: resolvedTournamentId,
            mode: "create-division",
          });
      toast.success("start.gg import completed.");
      await onImported?.({ tournamentId: response.tournamentId, divisionId: response.divisionId });
      onClose();
    } catch {
      toast.error("Failed to import from start.gg.");
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <button type="button" onClick={handlePreview} disabled={loadingPreview || !eventSlug.trim()} className={`${btnSecondary} text-sm`}>
        {loadingPreview ? "Previewing..." : "Preview"}
      </button>
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className={`${btnSecondary} text-sm`}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={submitting || !preview || !resolvedTournamentId}
          className={`${btnPrimary} text-sm`}
        >
          {submitting ? "Importing..." : "Confirm import"}
        </button>
      </div>
    </div>
  );

  return (
    <BaseModal open={open} onClose={onClose} title="Import from start.gg" maxWidth="max-w-4xl" footer={footer}>
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">Event slug</label>
            <input
              value={eventSlug}
              onChange={(event) => setEventSlug(event.target.value)}
              placeholder="tournament/example/event/singles"
              autoFocus
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">Target tournament</label>
            {fixedTournamentId ? (
              <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {fixedTournamentName ?? `Tournament #${fixedTournamentId}`}
              </div>
            ) : (
              <select
                value={selectedTournamentId}
                onChange={(event) => setSelectedTournamentId(event.target.value ? Number(event.target.value) : "")}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/30"
              >
                <option value="">Select a tournament</option>
                {availableTournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {!fixedTournamentId && availableTournaments.length === 0 && (
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            No editable tournaments are available for import.
          </p>
        )}

        {preview && (
          <div className="flex flex-col gap-4">
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Event</p>
                  <h3 className="text-lg font-semibold text-gray-900">{preview.event.name}</h3>
                  <p className="text-sm text-gray-500">{preview.event.slug}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <span>Participants: {preview.counts.participants}</span>
                  <span>Entrants: {preview.counts.entrants}</span>
                  <span>Phases: {preview.counts.phases}</span>
                  <span>Matches: {preview.counts.matches}</span>
                </div>
              </div>
            </div>

            <section className="rounded border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Division</h4>
                  <p className="text-sm text-gray-500">Local division target for this event import.</p>
                </div>
                <ActionBadge action={preview.division.action} />
              </div>
              <p className="text-sm text-gray-800">{preview.division.name}</p>
            </section>

            <section className="rounded border border-gray-200 p-4">
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900">Participants</h4>
                <p className="text-sm text-gray-500">How each imported player identity will resolve locally.</p>
              </div>
              <div className="grid gap-2">
                {preview.participants.map((participant) => (
                  <div key={participant.externalId} className="flex items-center justify-between gap-3 rounded bg-gray-50 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{participant.gamerTag}</p>
                      <p className="text-xs text-gray-500">start.gg participant {participant.externalId}</p>
                    </div>
                    <ActionBadge action={participant.action} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded border border-gray-200 p-4">
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900">Entrants and seeding</h4>
                <p className="text-sm text-gray-500">Event entrants, including singles and team cases.</p>
              </div>
              <div className="grid gap-2">
                {preview.entrants.map((entrant) => (
                  <div key={entrant.externalId} className="flex items-center justify-between gap-3 rounded bg-gray-50 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{entrant.name}</p>
                      <p className="text-xs text-gray-500">
                        {entrant.type} entrant
                        {entrant.seedNum !== null ? ` • seed ${entrant.seedNum}` : ""}
                      </p>
                    </div>
                    <ActionBadge action={entrant.action} />
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded border border-gray-200 p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900">Phases</h4>
                  <p className="text-sm text-gray-500">Phase structure to create or reuse.</p>
                </div>
                <div className="grid gap-2">
                  {preview.phases.map((phase) => (
                    <div key={phase.externalId} className="flex items-center justify-between gap-3 rounded bg-gray-50 px-3 py-2 text-sm">
                      <span className="font-medium text-gray-900">{phase.name}</span>
                      <ActionBadge action={phase.action} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded border border-gray-200 p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900">Matches</h4>
                  <p className="text-sm text-gray-500">Imported sets that will become local matches.</p>
                </div>
                <div className="grid gap-2">
                  {preview.matches.slice(0, 12).map((match) => (
                    <div key={match.externalId} className="flex items-center justify-between gap-3 rounded bg-gray-50 px-3 py-2 text-sm">
                      <span className="font-medium text-gray-900">{match.name}</span>
                      <ActionBadge action={match.action} />
                    </div>
                  ))}
                  {preview.matches.length > 12 && (
                    <p className="text-xs text-gray-500">Showing 12 of {preview.matches.length} matches in preview.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
