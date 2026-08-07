import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { environment } from "../../../environments/environment";
import { Admin } from "./admin";

describe("Admin", () => {
  let httpMock: HttpTestingController;
  const usersUrl = `${environment.apiUrl}/users`;
  const teamsUrl = `${environment.apiUrl}/teams`;
  const settingsUrl = `${environment.apiUrl}/settings`;
  const calendarUrl = `${environment.apiUrl}/calendar`;
  const activityUrl = `${environment.apiUrl}/activity-logs`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function createAndInit() {
    const fixture = TestBed.createComponent(Admin);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url === usersUrl).flush({
      success: true, message: "ok",
      data: {
        items: [
          { id: 1, name: "Rahul Sharma", email: "rahul@devpulse.com", role: "Manager", status: "Active" },
          { id: 2, name: "Priya Patel", email: "priya@devpulse.com", role: "Developer", status: "Active" },
          { id: 3, name: "Sam Tester", email: "sam@devpulse.com", role: "Tester", status: "Inactive" }
        ],
        pagination: { page: 1, pageSize: 100, total: 3, totalPages: 1 }
      }
    });
    httpMock.expectOne((r) => r.url === teamsUrl).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 100, total: 0, totalPages: 0 } } });
    httpMock.expectOne(settingsUrl).flush({ success: true, message: "ok", data: {} });
    httpMock.expectOne((r) => r.url === calendarUrl).flush({ success: true, message: "ok", data: [] });

    return { fixture, component: fixture.componentInstance };
  }

  it("filteredUsers matches by name or email, case-insensitively", () => {
    const { component } = createAndInit();

    component.userSearch.set("priya");
    expect(component.filteredUsers().map((u) => u.id)).toEqual([2]);

    component.userSearch.set("DEVPULSE.COM");
    expect(component.filteredUsers().length).toBe(3);
  });

  it("filteredUsers narrows by role filter", () => {
    const { component } = createAndInit();

    component.userRoleFilter.set("Tester");
    expect(component.filteredUsers().map((u) => u.id)).toEqual([3]);
  });

  it("filteredUsers combines search and role filter", () => {
    const { component } = createAndInit();

    component.userSearch.set("sharma");
    component.userRoleFilter.set("Developer");
    expect(component.filteredUsers().length).toBe(0);
  });

  it("loadActivityLogs sends the current filters and page, and stores pagination meta", () => {
    const { component } = createAndInit();
    component.setTab("activity");
    httpMock.expectOne((r) => r.url === activityUrl).flush({
      success: true, message: "ok",
      data: { items: [{ id: 1, action: "Created", module_name: "Task" }], pagination: { page: 1, pageSize: 20, total: 45, totalPages: 3 } }
    });

    component.activityFilterForm.patchValue({ module_name: "Task", from: "2026-07-01", to: "2026-07-31" });
    component.applyActivityFilters();

    const req = httpMock.expectOne((r) => r.url === activityUrl);
    expect(req.request.params.get("module_name")).toBe("Task");
    expect(req.request.params.get("from")).toBe("2026-07-01");
    expect(req.request.params.get("to")).toBe("2026-07-31");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });

    expect(component.activityPage()).toBe(1);
  });

  it("goToActivityPage requests the next page", () => {
    const { component } = createAndInit();
    component.setTab("activity");
    httpMock.expectOne((r) => r.url === activityUrl).flush({
      success: true, message: "ok",
      data: { items: [], pagination: { page: 1, pageSize: 20, total: 45, totalPages: 3 } }
    });

    component.goToActivityPage(2);

    const req = httpMock.expectOne((r) => r.url === activityUrl);
    expect(req.request.params.get("page")).toBe("2");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 2, pageSize: 20, total: 45, totalPages: 3 } } });

    expect(component.activityPage()).toBe(2);
    expect(component.activityTotalPages()).toBe(3);
  });

  it("pagedUsers shows at most 10 users per page, and usersTotalPages reflects the filtered count", () => {
    const fixture = TestBed.createComponent(Admin);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const twelveUsers = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1, name: `User ${i + 1}`, email: `user${i + 1}@devpulse.com`, role: "Developer", status: "Active"
    }));
    httpMock.expectOne((r) => r.url === usersUrl).flush({
      success: true, message: "ok",
      data: { items: twelveUsers, pagination: { page: 1, pageSize: 100, total: 12, totalPages: 1 } }
    });
    httpMock.expectOne((r) => r.url === teamsUrl).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 100, total: 0, totalPages: 0 } } });
    httpMock.expectOne(settingsUrl).flush({ success: true, message: "ok", data: {} });
    httpMock.expectOne((r) => r.url === calendarUrl).flush({ success: true, message: "ok", data: [] });

    expect(component.pagedUsers().length).toBe(10);
    expect(component.usersTotalPages()).toBe(2);

    component.goToUsersPage(2);
    expect(component.pagedUsers().length).toBe(2);
    expect(component.pagedUsers()[0].id).toBe(11);
  });

  it("setUserSearch and setUserRoleFilter reset the current page back to 1", () => {
    const { component } = createAndInit();
    component.usersPage.set(2);

    component.setUserSearch("priya");
    expect(component.usersPage()).toBe(1);

    component.usersPage.set(2);
    component.setUserRoleFilter("Tester");
    expect(component.usersPage()).toBe(1);
  });

  it("clearActivityFilters resets the form and reloads page 1", () => {
    const { component } = createAndInit();
    component.setTab("activity");
    httpMock.expectOne((r) => r.url === activityUrl).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
    component.activityFilterForm.patchValue({ module_name: "Task" });
    component.activityPage.set(2);

    component.clearActivityFilters();

    const req = httpMock.expectOne((r) => r.url === activityUrl);
    expect(req.request.params.get("module_name")).toBeNull();
    expect(req.request.params.get("page")).toBe("1");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });

    expect(component.activityFilterForm.value.module_name).toBe("");
  });
});
