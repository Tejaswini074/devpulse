import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse, PaginatedResult } from "../models/api.model";
import { DailyLog, UserHours } from "../models/daily-log.model";

@Injectable({ providedIn: "root" })
export class DailyLogService {
  private readonly baseUrl = `${environment.apiUrl}/daily-logs`;

  constructor(private http: HttpClient) {}

  list(params: { project_id?: number; user_id?: number; from?: string; to?: string; page?: number } = {}): Observable<ApiResponse<PaginatedResult<DailyLog>>> {
    return this.http.get<ApiResponse<PaginatedResult<DailyLog>>>(this.baseUrl, { params: params as any });
  }

  create(payload: Partial<DailyLog>): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<DailyLog>): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  userHours(): Observable<ApiResponse<UserHours>> {
    return this.http.get<ApiResponse<UserHours>>(`${this.baseUrl}/user-hours`);
  }
}
