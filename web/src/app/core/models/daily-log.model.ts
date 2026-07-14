export interface DailyLog {
  id: number;
  log_code: string;
  user_id: number;
  user_name?: string;
  project_id: number;
  project_name?: string;
  task_id: number;
  task_title?: string;
  log_type: string;
  hours_worked: number;
  work_description: string;
  work_status: "In Progress" | "Completed" | "Blocked";
  approval_status: "Pending" | "Approved" | "Rejected";
  log_date: string;
}

export interface UserHours {
  todayHours: number;
  weeklyHours: number;
  monthlyHours: number;
}
