export interface WorkCalendarEntry {
  id: number;
  organization_id: number;
  calendar_date: string;
  day_type: "Working Day" | "Weekend" | "Holiday";
  holiday_name: string | null;
  holiday_type: "National" | "State" | "Company";
  working_hours: number;
  description: string | null;
}
