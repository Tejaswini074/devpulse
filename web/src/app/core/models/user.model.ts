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
