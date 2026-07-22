import { Injectable, computed, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";
import { AuthResponse, AuthUser } from "../models/user.model";
import { SocketService } from "./socket.service";

const ACCESS_TOKEN_KEY = "devpulse_access_token";
const REFRESH_TOKEN_KEY = "devpulse_refresh_token";
const USER_KEY = "devpulse_user";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly currentUserSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly role = computed(() => this.currentUserSignal()?.role ?? null);

  constructor(private http: HttpClient, private router: Router, private socket: SocketService) {}

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);
    this.socket.connect(response.accessToken);
  }

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((res) => this.persistSession(res.data)));
  }

  registerOrganization(payload: {
    organization_name: string;
    name: string;
    email: string;
    password: string;
  }): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/register-organization`, payload)
      .pipe(tap((res) => this.persistSession(res.data)));
  }

  forgotPassword(email: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/reset-password`, { token, newPassword });
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  refreshAccessToken(): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return this.http
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(`${this.baseUrl}/refresh-token`, {
        refreshToken: this.getRefreshToken()
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.socket.disconnect();
    this.router.navigate(["/login"]);
  }

  hasAnyRole(roles: string[]): boolean {
    const current = this.currentUserSignal()?.role;
    return !!current && roles.includes(current);
  }
}
