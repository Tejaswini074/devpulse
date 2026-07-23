import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter, Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { Profile } from "./profile";
import { UserProfile } from "../../core/models/user.model";

const PROFILE: UserProfile = {
  id: 1,
  employee_code: "EMP-1",
  name: "Rahul Sharma",
  email: "rahul@devpulse.com",
  role: "Manager",
  designation: "Lead",
  department: "Engineering",
  joining_date: "2025-01-01",
  profile_photo: null,
  github_username: "octocat",
  status: "Active",
  last_login: "2026-07-20T10:00:00Z",
  created_at: "2025-01-01T00:00:00Z"
};

describe("Profile", () => {
  let httpMock: HttpTestingController;
  const authUrl = `${environment.apiUrl}/auth`;
  const githubUrl = `${environment.apiUrl}/github`;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function createAndLoad() {
    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    httpMock.expectOne(`${authUrl}/profile`).flush({ success: true, message: "ok", data: PROFILE });
    return { fixture, component: fixture.componentInstance };
  }

  it("loads the profile and patches the profile + github forms", () => {
    const { component } = createAndLoad();

    expect(component.loading()).toBe(false);
    expect(component.profileForm.value.name).toBe("Rahul Sharma");
    expect(component.profileForm.value.designation).toBe("Lead");
    expect(component.githubForm.value.github_username).toBe("octocat");
  });

  it("saveProfile does not submit an invalid form", () => {
    const { component } = createAndLoad();
    component.profileForm.patchValue({ name: "a" });

    component.saveProfile();

    expect(component.profileForm.invalid).toBe(true);
    httpMock.expectNone((r) => r.method === "PUT" && r.url === `${authUrl}/profile`);
  });

  it("saveProfile PUTs the profile changes", () => {
    const { component } = createAndLoad();
    component.profileForm.patchValue({ name: "Rahul S." });

    component.saveProfile();

    const req = httpMock.expectOne(`${authUrl}/profile`);
    expect(req.request.method).toBe("PUT");
    req.flush({ success: true, message: "ok", data: null });

    expect(component.saving()).toBe(false);
  });

  it("saveGithubUsername saves the trimmed username", () => {
    const { component } = createAndLoad();
    component.githubForm.patchValue({ github_username: "  torvalds  " });

    component.saveGithubUsername();

    const req = httpMock.expectOne(`${githubUrl}/username`);
    expect(req.request.body).toEqual({ github_username: "torvalds" });
    req.flush({ success: true, message: "ok", data: null });
  });

  it("syncGithub shows the number of days updated on success", () => {
    const { component } = createAndLoad();

    component.syncGithub();
    const req = httpMock.expectOne(`${githubUrl}/sync`);
    req.flush({ success: true, message: "ok", data: { synced: true, daysUpdated: 3 } });

    expect(component.syncing()).toBe(false);
  });

  it("syncGithub surfaces the reason when nothing was synced", () => {
    const { component } = createAndLoad();

    component.syncGithub();
    httpMock.expectOne(`${githubUrl}/sync`).flush({ success: true, message: "ok", data: { synced: false, reason: "No GitHub username set" } });

    expect(component.syncing()).toBe(false);
  });

  it("changePassword does not submit when passwords do not match", () => {
    const { component } = createAndLoad();
    component.passwordForm.setValue({ currentPassword: "old", newPassword: "NewPass1!", confirmPassword: "Different1!" });

    component.changePassword();

    expect(component.passwordForm.invalid).toBe(true);
    httpMock.expectNone((r) => r.method === "PUT" && r.url === `${authUrl}/change-password`);
  });

  it("changePassword submits matching passwords and logs the user out on success", () => {
    jasmine.clock().install();
    const { component } = createAndLoad();
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, "navigate");
    component.passwordForm.setValue({ currentPassword: "old", newPassword: "NewPass1!", confirmPassword: "NewPass1!" });

    component.changePassword();

    const req = httpMock.expectOne(`${authUrl}/change-password`);
    expect(req.request.body).toEqual({ currentPassword: "old", newPassword: "NewPass1!" });
    req.flush({ success: true, message: "ok", data: null });

    jasmine.clock().tick(1600);
    expect(navigateSpy).toHaveBeenCalledWith(["/login"]);
    jasmine.clock().uninstall();
  });
});
