import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";

@Injectable({ providedIn: "root" })
export class InviteService {
  private readonly baseUrl = `${environment.apiUrl}/invite`;

  constructor(private http: HttpClient) {}

  inviteUser(payload: { name: string; email: string; role: string; team_id?: number; designation?: string; department?: string }): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(this.baseUrl, payload);
  }

  verify(token: string): Observable<ApiResponse<{ name: string; email: string; role: string; designation: string | null }>> {
    return this.http.get<ApiResponse<{ name: string; email: string; role: string; designation: string | null }>>(`${this.baseUrl}/${token}`);
  }

  accept(token: string, password: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/accept`, { token, password });
  }

  resend(token: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/resend`, { token });
  }
}
