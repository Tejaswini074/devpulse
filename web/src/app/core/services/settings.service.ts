import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";
import { AppSettings } from "../models/settings.model";

@Injectable({ providedIn: "root" })
export class SettingsService {
  private readonly baseUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<AppSettings>> {
    return this.http.get<ApiResponse<AppSettings>>(this.baseUrl);
  }

  update(settings: AppSettings): Observable<ApiResponse<AppSettings>> {
    return this.http.put<ApiResponse<AppSettings>>(this.baseUrl, settings);
  }
}
