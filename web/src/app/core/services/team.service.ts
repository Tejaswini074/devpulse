import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse, PaginatedResult } from "../models/api.model";
import { Team } from "../models/team.model";

@Injectable({ providedIn: "root" })
export class TeamService {
  private readonly baseUrl = `${environment.apiUrl}/teams`;

  constructor(private http: HttpClient) {}

  list(): Observable<ApiResponse<PaginatedResult<Team>>> {
    return this.http.get<ApiResponse<PaginatedResult<Team>>>(this.baseUrl, { params: { pageSize: "100" } });
  }

  getById(id: number): Observable<ApiResponse<Team>> {
    return this.http.get<ApiResponse<Team>>(`${this.baseUrl}/${id}`);
  }

  create(payload: { team_name: string; description?: string; manager_id?: number }): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  update(id: number, payload: { team_name: string; description?: string; manager_id?: number; status?: string }): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.baseUrl}/${id}`, payload);
  }

  deactivate(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
