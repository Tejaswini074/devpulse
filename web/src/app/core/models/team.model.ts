export interface Team {
  id: number;
  organization_id: number;
  team_name: string;
  description: string | null;
  manager_id: number | null;
  manager_name?: string;
  status: "Active" | "Inactive";
  member_count?: number;
  members?: TeamMember[];
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  designation: string | null;
  status: string;
}
