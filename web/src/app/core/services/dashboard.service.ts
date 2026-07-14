import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";
import { DashboardOverview, ProductivityScore, TeamOverviewRow, WeeklyReport } from "../models/dashboard.model";

@Injectable({ providedIn: "root" })
export class DashboardService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMine(): Observable<ApiResponse<DashboardOverview>> {
    return this.http.get<ApiResponse<DashboardOverview>>(`${this.baseUrl}/dashboard`);
  }

  getTeam(teamId?: number): Observable<ApiResponse<TeamOverviewRow[]>> {
    return this.http.get<ApiResponse<TeamOverviewRow[]>>(`${this.baseUrl}/dashboard/team`, {
      params: teamId ? { team_id: teamId } : {}
    });
  }

  getMyProductivity(): Observable<ApiResponse<ProductivityScore>> {
    return this.http.get<ApiResponse<ProductivityScore>>(`${this.baseUrl}/productivity/me`);
  }

  getWeeklyReport(): Observable<ApiResponse<WeeklyReport>> {
    return this.http.get<ApiResponse<WeeklyReport>>(`${this.baseUrl}/reports/weekly`);
  }

  downloadCsv(from?: string, to?: string): Observable<Blob> {
    const params: Record<string, string> = {};
    if (from) params["from"] = from;
    if (to) params["to"] = to;
    return this.http.get(`${this.baseUrl}/reports/export`, { params, responseType: "blob" });
  }
}
