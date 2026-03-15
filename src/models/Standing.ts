import { Player } from '@/models/Player'
import { Song } from '@/models/Song'

export interface Score {
  id: number;
  percentage: number;
  isFailed: boolean;
  player: Player;
  song: Song;
}

export interface Standing {
  id: number;
  score: Score;
  points: number;
}
