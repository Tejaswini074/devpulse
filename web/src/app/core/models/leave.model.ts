export type LeaveType = "Casual" | "Sick" | "Earned" | "Work From Home" | "Comp Off";
export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface LeaveRequest {
  id: number;
  organization_id: number;
  user_id: number;
  user_name?: string;
  leave_type: LeaveType | null;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: LeaveStatus;
  approved_by: number | null;
  approved_at: string | null;
  remarks: string | null;
  created_at: string;
}
