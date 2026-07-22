import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse, PaginatedResult } from "../models/api.model";
import { ActivityLog } from "../models/activity-log.model";

@Injectable({ providedIn: "root" })
export class ActivityLogService {
  private readonly baseUrl = `${environment.apiUrl}/activity-logs`;

  constructor(private http: HttpClient) {}

  list(params: { module_name?: string; user_id?: number; page?: number } = {}): Observable<ApiResponse<PaginatedResult<ActivityLog>>> {
    return this.http.get<ApiResponse<PaginatedResult<ActivityLog>>>(this.baseUrl, { params: params as any });
  }
}
