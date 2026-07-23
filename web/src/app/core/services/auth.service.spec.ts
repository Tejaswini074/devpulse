import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter, Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { AuthService } from "./auth.service";
import { AuthResponse } from "../models/user.model";

describe("AuthService", () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const authResponse: AuthResponse = {
    accessToken: "access-123",
    refreshToken: "refresh-123",
    user: { id: 1, name: "Rahul Sharma", email: "rahul@devpulse.com", role: "Manager", organization_id: 2, team_id: 2 }
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it("starts logged out when localStorage has no stored user", () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it("login persists tokens + user and flips isLoggedIn to true", () => {
    service.login("rahul@devpulse.com", "Admin@123").subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe("POST");
    req.flush({ success: true, message: "ok", data: authResponse });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.email).toBe("rahul@devpulse.com");
    expect(service.role()).toBe("Manager");
    expect(localStorage.getItem("devpulse_access_token")).toBe("access-123");
  });

  it("registerOrganization persists the session the same way login does", () => {
    service.registerOrganization({ organization_name: "Acme", name: "Jane", email: "jane@acme.com", password: "pw" }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register-organization`);
    expect(req.request.method).toBe("POST");
    req.flush({ success: true, message: "ok", data: { ...authResponse, user: { ...authResponse.user, email: "jane@acme.com" } } });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.email).toBe("jane@acme.com");
  });

  it("hasAnyRole matches only against the current user's role", () => {
    service.login("rahul@devpulse.com", "Admin@123").subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ success: true, message: "ok", data: authResponse });

    expect(service.hasAnyRole(["Manager", "Admin"])).toBe(true);
    expect(service.hasAnyRole(["Admin", "Super Admin"])).toBe(false);
  });

  it("hasAnyRole is false for every role when logged out", () => {
    expect(service.hasAnyRole(["Admin", "Manager", "Developer"])).toBe(false);
  });

  it("logout clears storage, resets state, and navigates to /login", () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, "navigate");

    service.login("rahul@devpulse.com", "Admin@123").subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ success: true, message: "ok", data: authResponse });

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem("devpulse_access_token")).toBeNull();
    expect(localStorage.getItem("devpulse_user")).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(["/login"]);
  });

  it("refreshAccessToken overwrites the stored tokens without touching the stored user", () => {
    service.login("rahul@devpulse.com", "Admin@123").subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ success: true, message: "ok", data: authResponse });

    service.refreshAccessToken().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh-token`);
    req.flush({ success: true, message: "ok", data: { accessToken: "new-access", refreshToken: "new-refresh" } });

    expect(service.getAccessToken()).toBe("new-access");
    expect(service.getRefreshToken()).toBe("new-refresh");
    expect(service.currentUser()?.email).toBe("rahul@devpulse.com");
  });

  it("getProfile GETs the profile endpoint", () => {
    service.getProfile().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: { id: 1, name: "Rahul Sharma", email: "rahul@devpulse.com" } });
  });

  it("updateProfile PUTs the profile endpoint and updates the stored user's name", () => {
    service.login("rahul@devpulse.com", "Admin@123").subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ success: true, message: "ok", data: authResponse });

    service.updateProfile({ name: "Rahul S." }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual({ name: "Rahul S." });
    req.flush({ success: true, message: "ok", data: null });

    expect(service.currentUser()?.name).toBe("Rahul S.");
    expect(JSON.parse(localStorage.getItem("devpulse_user")!).name).toBe("Rahul S.");
  });

  it("updateProfile does not touch the stored user when no name is given", () => {
    service.login("rahul@devpulse.com", "Admin@123").subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ success: true, message: "ok", data: authResponse });

    service.updateProfile({ designation: "Engineer" }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/profile`).flush({ success: true, message: "ok", data: null });

    expect(service.currentUser()?.name).toBe("Rahul Sharma");
  });

  it("changePassword PUTs current and new passwords to the change-password endpoint", () => {
    service.changePassword("oldpw", "NewPass1!").subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual({ currentPassword: "oldpw", newPassword: "NewPass1!" });
    req.flush({ success: true, message: "ok", data: null });
  });
});
