import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse, PaginatedResult } from "../models/api.model";
import { AppNotification } from "../models/notification.model";
import { SocketService } from "./socket.service";

@Injectable({ providedIn: "root" })
export class NotificationService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient, private socket: SocketService) {}

  list(params: { unread?: boolean; page?: number } = {}): Observable<ApiResponse<PaginatedResult<AppNotification>>> {
    return this.http.get<ApiResponse<PaginatedResult<AppNotification>>>(this.baseUrl, {
      params: params as any
    });
  }

  unreadCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.baseUrl}/unread-count`);
  }

  markRead(id: number): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/read-all`, {});
  }

  onNewNotification(): Observable<AppNotification> {
    return this.socket.on<AppNotification>("notification:new");
  }
}
