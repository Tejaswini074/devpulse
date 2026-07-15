import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { roleGuard } from "./role.guard";

describe("roleGuard", () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  function runGuard(allowedRoles: string[]): boolean {
    return TestBed.runInInjectionContext(() => roleGuard(allowedRoles)({} as any, {} as any)) as boolean;
  }

  function loginAs(role: string): void {
    localStorage.setItem("devpulse_access_token", "tok");
    localStorage.setItem("devpulse_user", JSON.stringify({ id: 1, name: "Test User", email: "t@x.com", role, organization_id: 2, team_id: 2 }));
  }

  it("allows navigation when the current user's role is in the allowed list", () => {
    loginAs("Admin");
    expect(runGuard(["Admin", "Super Admin"])).toBe(true);
  });

  it("blocks and redirects to /dashboard when the role is not allowed", () => {
    loginAs("Developer");
    const navigateSpy = spyOn(router, "navigate");

    expect(runGuard(["Admin", "Super Admin", "Manager"])).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(["/dashboard"]);
  });

  it("blocks when logged out entirely (no current user)", () => {
    const navigateSpy = spyOn(router, "navigate");
    expect(runGuard(["Admin"])).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(["/dashboard"]);
  });
});
