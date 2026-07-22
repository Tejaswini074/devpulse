export type AttachmentModuleName = "Project" | "Task" | "DailyLog";

export interface Attachment {
  id: number;
  module_name: AttachmentModuleName;
  record_id: number;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
}
