export interface ActivityLog {
  id: number;
  organization_id: number;
  user_id: number | null;
  user_name: string | null;
  module_name: string | null;
  module_id: number | null;
  action: string | null;
  description: string | null;
  browser: string | null;
  ip_address: string | null;
  created_at: string;
}
