import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse, PaginatedResult } from "../models/api.model";
import { LeaveRequest, LeaveType } from "../models/leave.model";

@Injectable({ providedIn: "root" })
export class LeaveService {
  private readonly baseUrl = `${environment.apiUrl}/leave`;

  constructor(private http: HttpClient) {}

  create(payload: { leave_type?: LeaveType; start_date: string; end_date: string; reason?: string }): Observable<ApiResponse<{ id: number; total_days: number }>> {
    return this.http.post<ApiResponse<{ id: number; total_days: number }>>(this.baseUrl, payload);
  }

  listMine(): Observable<ApiResponse<PaginatedResult<LeaveRequest>>> {
    return this.http.get<ApiResponse<PaginatedResult<LeaveRequest>>>(`${this.baseUrl}/me`);
  }

  listTeam(): Observable<ApiResponse<PaginatedResult<LeaveRequest>>> {
    return this.http.get<ApiResponse<PaginatedResult<LeaveRequest>>>(`${this.baseUrl}/team`);
  }

  updateStatus(id: number, status: "Approved" | "Rejected", remarks?: string): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/${id}/status`, { status, remarks });
  }

  cancel(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
