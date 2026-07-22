import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { environment } from "../../../environments/environment";
import { LeavePage } from "./leave";

const USER_KEY = "devpulse_user";

function setUser(role: string): void {
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 1, name: "Test User", email: "t@devpulse.com", role, organization_id: 1, team_id: 1 }));
}

describe("LeavePage", () => {
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/leave`;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LeavePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it("loads only 'my requests' for a Developer, who cannot approve", () => {
    setUser("Developer");
    const fixture = TestBed.createComponent(LeavePage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.canApprove).toBe(false);
    expect(component.tabs.length).toBe(1);
    httpMock.expectOne(`${baseUrl}/me`).flush({
      success: true, message: "ok",
      data: { items: [{ id: 1, status: "Pending", leave_type: "Casual", start_date: "2026-08-01", end_date: "2026-08-02", total_days: 2 }], pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 } }
    });
    httpMock.expectNone(`${baseUrl}/team`);

    expect(component.myRequests().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it("also loads team requests for a Manager", () => {
    setUser("Manager");
    const fixture = TestBed.createComponent(LeavePage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.canApprove).toBe(true);
    expect(component.tabs.map((t) => t.id)).toEqual(["mine", "team"]);

    httpMock.expectOne(`${baseUrl}/me`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
    httpMock.expectOne(`${baseUrl}/team`).flush({
      success: true, message: "ok",
      data: { items: [{ id: 2, status: "Pending", user_name: "Priya", leave_type: "Sick", start_date: "2026-08-05", end_date: "2026-08-05", total_days: 1 }], pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 } }
    });

    expect(component.teamRequests().length).toBe(1);
  });

  it("does not submit an invalid form", () => {
    setUser("Developer");
    const fixture = TestBed.createComponent(LeavePage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/me`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });

    component.submit();

    expect(component.form.invalid).toBe(true);
    httpMock.expectNone((r) => r.method === "POST" && r.url === baseUrl);
  });

  it("submits a valid leave request, closes the form, and reloads mine", () => {
    setUser("Developer");
    const fixture = TestBed.createComponent(LeavePage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/me`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });

    component.showForm.set(true);
    component.form.setValue({ leave_type: "Casual", start_date: "2026-08-01", end_date: "2026-08-02", reason: "Trip" });
    component.submit();

    const req = httpMock.expectOne(`${baseUrl}`);
    expect(req.request.method).toBe("POST");
    req.flush({ success: true, message: "ok", data: { id: 9, total_days: 2 } });

    httpMock.expectOne(`${baseUrl}/me`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });

    expect(component.showForm()).toBe(false);
  });

  it("decide() approves a team request and reloads the team list", () => {
    setUser("Manager");
    const fixture = TestBed.createComponent(LeavePage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/me`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
    httpMock.expectOne(`${baseUrl}/team`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });

    component.decide(2, "Approved");

    const req = httpMock.expectOne(`${baseUrl}/2/status`);
    expect(req.request.body).toEqual({ status: "Approved", remarks: undefined });
    req.flush({ success: true, message: "ok", data: null });

    httpMock.expectOne(`${baseUrl}/team`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
  });

  it("maps each status to a distinct badge color", () => {
    setUser("Developer");
    const fixture = TestBed.createComponent(LeavePage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/me`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });

    expect(component.statusColor("Approved")).toContain("green");
    expect(component.statusColor("Rejected")).toContain("red");
    expect(component.statusColor("Cancelled")).toContain("slate");
    expect(component.statusColor("Pending")).toContain("amber");
  });
});
