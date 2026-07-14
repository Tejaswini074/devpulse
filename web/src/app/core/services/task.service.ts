import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse, PaginatedResult } from "../models/api.model";
import { Task, TaskStatus } from "../models/task.model";

@Injectable({ providedIn: "root" })
export class TaskService {
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  list(params: { project_id?: number; status?: string; assigned_to?: number } = {}): Observable<ApiResponse<PaginatedResult<Task>>> {
    return this.http.get<ApiResponse<PaginatedResult<Task>>>(this.baseUrl, {
      params: { pageSize: "200", ...params } as any
    });
  }

  getById(id: number): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Task>): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Task>): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.baseUrl}/${id}`, payload);
  }

  updateStatus(id: number, status: TaskStatus): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/${id}/status`, { status });
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
