import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { TaskService } from "./task.service";

describe("TaskService", () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("list() always requests a large pageSize so the kanban board sees every task", () => {
    service.list({ project_id: 7 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.get("pageSize")).toBe("200");
    expect(req.request.params.get("project_id")).toBe("7");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 200, total: 0, totalPages: 0 } } });
  });

  it("an explicit pageSize passed by the caller overrides the 200 default", () => {
    service.list({ project_id: 7, pageSize: 50 } as any).subscribe();
    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.get("pageSize")).toBe("50");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 } } });
  });

  it("updateStatus() PATCHes the status sub-resource with the new status", () => {
    service.updateStatus(4, "Done").subscribe();
    const req = httpMock.expectOne(`${baseUrl}/4/status`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ status: "Done" });
    req.flush({ success: true, message: "ok", data: null });
  });

  it("remove() DELETEs the task by id", () => {
    service.remove(4).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/4`);
    expect(req.request.method).toBe("DELETE");
    req.flush({ success: true, message: "ok", data: null });
  });
});
