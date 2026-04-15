import axios from "axios";
import {
  StartggImportPreviewRequest,
  StartggImportPreviewResponse,
  StartggImportResponse,
} from "@/features/tournament/types/StartggImport";

export async function previewStartggImport(
  payload: StartggImportPreviewRequest,
): Promise<StartggImportPreviewResponse> {
  const response = await axios.post<StartggImportPreviewResponse>("integrations/startgg/import-preview", payload);
  return response.data;
}

export async function importStartggEvent(
  payload: Required<Pick<StartggImportPreviewRequest, "eventSlug">> & { targetTournamentId: number; mode?: string },
): Promise<StartggImportResponse> {
  const response = await axios.post<StartggImportResponse>("integrations/startgg/import", payload);
  return response.data;
}

export async function previewTournamentStartggImport(
  tournamentId: number,
  payload: Omit<StartggImportPreviewRequest, "targetTournamentId">,
): Promise<StartggImportPreviewResponse> {
  const response = await axios.post<StartggImportPreviewResponse>(`tournaments/${tournamentId}/startgg/import-preview`, payload);
  return response.data;
}

export async function importTournamentStartggEvent(
  tournamentId: number,
  payload: Omit<StartggImportPreviewRequest, "targetTournamentId">,
): Promise<StartggImportResponse> {
  const response = await axios.post<StartggImportResponse>(`tournaments/${tournamentId}/startgg/import`, payload);
  return response.data;
}
