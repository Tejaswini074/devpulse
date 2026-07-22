export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  parent_comment_id: number | null;
  comment: string;
  is_edited: number;
  created_at: string;
  updated_at: string;
}
