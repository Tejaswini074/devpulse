import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { SprintService } from "./sprint.service";

describe("SprintService", () => {
  let service: SprintService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/sprints`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SprintService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("listByProject() GETs sprints scoped to the project", () => {
    service.listByProject(7).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/project/7`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: [] });
  });

  it("getById() GETs the sprint detail with its tasks", () => {
    service.getById(1).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: { id: 1, tasks: [], points_total: 0, points_done: 0, completion_pct: 0 } });
  });

  it("updateStatus() PATCHes the sprint's status", () => {
    service.updateStatus(1, "Active").subscribe();
    const req = httpMock.expectOne(`${baseUrl}/1/status`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ status: "Active" });
    req.flush({ success: true, message: "ok", data: null });
  });

  it("remove() DELETEs the sprint by id", () => {
    service.remove(1).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe("DELETE");
    req.flush({ success: true, message: "ok", data: null });
  });
});
