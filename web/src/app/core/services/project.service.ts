import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse, PaginatedResult } from "../models/api.model";
import { Project } from "../models/project.model";

@Injectable({ providedIn: "root" })
export class ProjectService {
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  list(params: { status?: string; page?: number } = {}): Observable<ApiResponse<PaginatedResult<Project>>> {
    return this.http.get<ApiResponse<PaginatedResult<Project>>>(this.baseUrl, { params: params as any });
  }

  getById(id: number): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Project>): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Project>): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  addMember(projectId: number, userId: number, memberRole?: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/${projectId}/members`, {
      user_id: userId,
      member_role: memberRole
    });
  }

  removeMember(projectId: number, userId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${projectId}/members/${userId}`);
  }
}
