import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { DashboardService } from "./dashboard.service";

describe("DashboardService", () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("getMine() GETs the personal dashboard overview", () => {
    service.getMine().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: { todayHours: 1, weeklyHours: 5, commits: 2, completedTasks: 1, productivityScore: 50 } });
  });

  it("getTeam() omits the team_id param entirely when not provided", () => {
    service.getTeam().subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/dashboard/team`);
    expect(req.request.params.has("team_id")).toBe(false);
    req.flush({ success: true, message: "ok", data: [] });
  });

  it("getTeam() forwards a team_id when provided", () => {
    service.getTeam(3).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/dashboard/team`);
    expect(req.request.params.get("team_id")).toBe("3");
    req.flush({ success: true, message: "ok", data: [] });
  });

  it("downloadCsv() requests a blob response type", () => {
    service.downloadCsv("2026-07-01", "2026-07-15").subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/reports/export`);
    expect(req.request.responseType).toBe("blob");
    expect(req.request.params.get("from")).toBe("2026-07-01");
    expect(req.request.params.get("to")).toBe("2026-07-15");
    req.flush(new Blob(["Date,Project"]));
  });

  it("downloadCsv() sends no date params when called with no arguments", () => {
    service.downloadCsv().subscribe();
    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/reports/export`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush(new Blob([""]));
  });
});
