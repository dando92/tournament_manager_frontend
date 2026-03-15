import { Phase } from "@/models/Phase";

export interface Division {
  id: number;
  name: string;
  phases: Phase[];
}
