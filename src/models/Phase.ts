import { Match } from '@/models/Match'

export interface Phase {
  id: number;
  name: string;
  matches: Match[];
}
