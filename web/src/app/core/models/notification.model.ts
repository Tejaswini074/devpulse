export type NotificationType = "Task" | "Project" | "Comment" | "Mention" | "Reminder" | "Approval" | "Leave" | "System";

export interface AppNotification {
  id: number;
  organization_id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  action_url: string | null;
  is_read: number;
  read_at: string | null;
  created_at: string;
}
