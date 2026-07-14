import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";
import { Milestone } from "../models/project.model";

@Injectable({ providedIn: "root" })
export class MilestoneService {
  private readonly baseUrl = `${environment.apiUrl}/milestones`;

  constructor(private http: HttpClient) {}

  listByProject(projectId: number): Observable<ApiResponse<Milestone[]>> {
    return this.http.get<ApiResponse<Milestone[]>>(this.baseUrl, { params: { project_id: projectId } });
  }

  create(payload: { project_id: number; title: string; description?: string; target_date?: string }): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  updateStatus(id: number, status: "Pending" | "Completed"): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/${id}/status`, { status });
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
