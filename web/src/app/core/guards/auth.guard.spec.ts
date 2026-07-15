import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { authGuard } from "./auth.guard";

describe("authGuard", () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  function runGuard(): boolean {
    return TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as boolean;
  }

  it("allows navigation when the user is logged in", () => {
    // AuthService reads localStorage in its constructor, so it must be
    // populated before the service is first injected (here, inside the guard).
    localStorage.setItem("devpulse_access_token", "tok");
    localStorage.setItem("devpulse_user", JSON.stringify({ id: 1, name: "Rahul", email: "r@x.com", role: "Manager", organization_id: 2, team_id: 2 }));

    expect(runGuard()).toBe(true);
  });

  it("blocks navigation and redirects to /login when logged out", () => {
    const navigateSpy = spyOn(router, "navigate");

    expect(runGuard()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(["/login"]);
  });
});
