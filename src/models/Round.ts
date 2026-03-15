import { Standing } from "@/models/Standing";
import { Song } from "@/models/Song";

export interface Round {
  id: number;
  standings: Standing[];
  song: Song;
}
