import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { ProjectService } from "./project.service";

describe("ProjectService", () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/projects`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("list() GETs the projects collection", () => {
    service.list().subscribe();
    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
  });

  it("getById() GETs a single project by id", () => {
    service.getById(7).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/7`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: {} });
  });

  it("create() POSTs the payload to the collection endpoint", () => {
    const payload = { project_name: "Mobile Revamp", project_manager: 3 };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, message: "ok", data: { id: 1 } });
  });

  it("addMember() POSTs user_id and member_role to the members sub-resource", () => {
    service.addMember(7, 3, "Contributor").subscribe();
    const req = httpMock.expectOne(`${baseUrl}/7/members`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ user_id: 3, member_role: "Contributor" });
    req.flush({ success: true, message: "ok", data: null });
  });

  it("removeMember() DELETEs the specific member", () => {
    service.removeMember(7, 3).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/7/members/3`);
    expect(req.request.method).toBe("DELETE");
    req.flush({ success: true, message: "ok", data: null });
  });
});
