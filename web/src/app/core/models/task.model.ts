export type TaskStatus = "Backlog" | "Todo" | "In Progress" | "Code Review" | "Testing" | "Done" | "Blocked";

export const TASK_STATUSES: TaskStatus[] = ["Todo", "In Progress", "Testing", "Done"];

export interface Task {
  id: number;
  organization_id: number;
  task_code: string;
  project_id: number;
  project_name?: string;
  assigned_to: number;
  assigned_to_name?: string;
  title: string;
  description: string | null;
  task_type: "Story" | "Feature" | "Bug" | "Task" | "Research" | "Documentation";
  priority: "Low" | "Medium" | "High" | "Critical";
  severity: "Low" | "Medium" | "High" | "Critical";
  status: TaskStatus;
  progress: number;
  estimated_hours: number | null;
  actual_hours: number;
  due_date: string | null;
  created_at: string;
}
