export interface DashboardOverview {
  todayHours: number;
  weeklyHours: number;
  commits: number;
  completedTasks: number;
  productivityScore: number;
}

export interface TeamOverviewRow {
  user_id: number;
  name: string;
  email: string;
  hours: string;
  commits: string;
  completed_tasks: number;
  score: string | null;
}

export interface WeeklyReportDay {
  day: string;
  date: string;
  hours: number;
  commits: number;
  tasksCompleted: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  days: WeeklyReportDay[];
  totals: { hours: number; commits: number; tasksCompleted: number };
}

export interface ProductivityScore {
  score: number;
  week: number | null;
  month: number | null;
  year: number | null;
  breakdown?: {
    completedTasks: number;
    assignedTasks: number;
    hoursWorked: number;
    commits: number;
  };
}
