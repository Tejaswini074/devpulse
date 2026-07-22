import { Task } from "./task.model";

export type SprintStatus = "Planned" | "Active" | "Completed";

export interface Sprint {
  id: number;
  project_id: number;
  sprint_name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: SprintStatus;
  created_at: string;
}

export interface SprintDetail extends Sprint {
  tasks: Task[];
  points_total: number;
  points_done: number;
  completion_pct: number;
}
