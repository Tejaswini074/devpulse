export interface Project {
  id: number;
  organization_id: number;
  project_code: string;
  project_name: string;
  description: string | null;
  project_type: "Internal" | "Client" | "Research";
  client_name: string | null;
  status: "Planned" | "Active" | "Completed" | "On Hold" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Critical";
  progress: number;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  project_manager: number;
  project_manager_name?: string;
  task_count?: number;
  completed_task_count?: number;
  members?: ProjectMember[];
  created_at: string;
}

export interface ProjectMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  member_role: string;
  status: string;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  target_date: string | null;
  status: "Pending" | "Completed";
}
