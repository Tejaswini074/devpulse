export type UserRole = "Super Admin" | "Admin" | "Manager" | "Developer" | "Tester";

export interface AuthUser {
  id: number;
  employee_code?: string;
  name: string;
  email: string;
  role: UserRole;
  organization_id: number;
  team_id: number | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface UserProfile {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string | null;
  department: string | null;
  joining_date: string | null;
  profile_photo: string | null;
  github_username: string | null;
  status: string;
  last_login: string | null;
  created_at: string;
}
