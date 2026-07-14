import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse, PaginatedResult } from "../models/api.model";

export interface OrgUser {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  role: string;
  designation: string | null;
  department: string | null;
  team_id: number | null;
  github_username: string | null;
  status: string;
}

@Injectable({ providedIn: "root" })
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  list(params: { team_id?: number; role?: string } = {}): Observable<ApiResponse<PaginatedResult<OrgUser>>> {
    return this.http.get<ApiResponse<PaginatedResult<OrgUser>>>(this.baseUrl, { params: params as any });
  }

  update(id: number, payload: { role?: string; team_id?: number; status?: string }): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
