import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";
import { Sprint, SprintDetail, SprintStatus } from "../models/sprint.model";

@Injectable({ providedIn: "root" })
export class SprintService {
  private readonly baseUrl = `${environment.apiUrl}/sprints`;

  constructor(private http: HttpClient) {}

  listByProject(projectId: number): Observable<ApiResponse<Sprint[]>> {
    return this.http.get<ApiResponse<Sprint[]>>(`${this.baseUrl}/project/${projectId}`);
  }

  getById(id: number): Observable<ApiResponse<SprintDetail>> {
    return this.http.get<ApiResponse<SprintDetail>>(`${this.baseUrl}/${id}`);
  }

  create(payload: { project_id: number; sprint_name: string; goal?: string; start_date?: string; end_date?: string }): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Sprint>): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.baseUrl}/${id}`, payload);
  }

  updateStatus(id: number, status: SprintStatus): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/${id}/status`, { status });
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
