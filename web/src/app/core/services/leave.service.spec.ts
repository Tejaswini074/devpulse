import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { LeaveService } from "./leave.service";

describe("LeaveService", () => {
  let service: LeaveService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/leave`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LeaveService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("create() POSTs the leave request payload", () => {
    service.create({ leave_type: "Casual", start_date: "2026-08-01", end_date: "2026-08-02" }).subscribe();
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe("POST");
    expect(req.request.body.leave_type).toBe("Casual");
    req.flush({ success: true, message: "ok", data: { id: 1, total_days: 2 } });
  });

  it("listMine() GETs the /me sub-resource", () => {
    service.listMine().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/me`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
  });

  it("listTeam() GETs the /team sub-resource", () => {
    service.listTeam().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/team`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
  });

  it("updateStatus() PATCHes status and remarks", () => {
    service.updateStatus(3, "Approved", "Enjoy!").subscribe();
    const req = httpMock.expectOne(`${baseUrl}/3/status`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ status: "Approved", remarks: "Enjoy!" });
    req.flush({ success: true, message: "ok", data: null });
  });

  it("cancel() DELETEs the leave request by id", () => {
    service.cancel(3).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/3`);
    expect(req.request.method).toBe("DELETE");
    req.flush({ success: true, message: "ok", data: null });
  });
});
