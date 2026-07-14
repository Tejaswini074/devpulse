import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";

@Injectable({ providedIn: "root" })
export class GithubService {
  private readonly baseUrl = `${environment.apiUrl}/github`;

  constructor(private http: HttpClient) {}

  setUsername(githubUsername: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.baseUrl}/username`, { github_username: githubUsername });
  }

  sync(): Observable<ApiResponse<{ synced: boolean; daysUpdated?: number; reason?: string }>> {
    return this.http.post<ApiResponse<{ synced: boolean; daysUpdated?: number; reason?: string }>>(`${this.baseUrl}/sync`, {});
  }

  getActivity(from: string, to: string): Observable<ApiResponse<{ activity_date: string; commit_count: number }[]>> {
    return this.http.get<ApiResponse<{ activity_date: string; commit_count: number }[]>>(`${this.baseUrl}/activity`, {
      params: { from, to }
    });
  }
}
