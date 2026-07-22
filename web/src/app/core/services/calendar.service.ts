import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";
import { WorkCalendarEntry } from "../models/calendar.model";

@Injectable({ providedIn: "root" })
export class CalendarService {
  private readonly baseUrl = `${environment.apiUrl}/calendar`;

  constructor(private http: HttpClient) {}

  listByYear(year: number): Observable<ApiResponse<WorkCalendarEntry[]>> {
    return this.http.get<ApiResponse<WorkCalendarEntry[]>>(this.baseUrl, { params: { year } });
  }

  create(payload: { calendar_date: string; holiday_name: string; holiday_type?: string; description?: string }): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(this.baseUrl, payload);
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
