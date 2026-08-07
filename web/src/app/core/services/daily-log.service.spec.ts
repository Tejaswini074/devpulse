import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { DailyLogService } from "./daily-log.service";

describe("DailyLogService", () => {
  let service: DailyLogService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/daily-logs`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(DailyLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("list() omits unset filters instead of sending them as the literal string 'undefined'", () => {
    service.list({ project_id: 3, page: 2 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.get("project_id")).toBe("3");
    expect(req.request.params.get("page")).toBe("2");
    expect(req.request.params.has("from")).toBe(false);
    expect(req.request.params.has("to")).toBe(false);
    expect(req.request.params.has("user_id")).toBe(false);
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 2, pageSize: 20, total: 0, totalPages: 0 } } });
  });

  it("list() sends a from/to date range when provided", () => {
    service.list({ from: "2026-07-01", to: "2026-07-31" }).subscribe();

    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.get("from")).toBe("2026-07-01");
    expect(req.request.params.get("to")).toBe("2026-07-31");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
  });
});
