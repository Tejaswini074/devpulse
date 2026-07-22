import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { CommentService } from "./comment.service";

describe("CommentService", () => {
  let service: CommentService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/comments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("listByTask() GETs comments scoped to the task", () => {
    service.listByTask(1).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/task/1`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: [] });
  });

  it("create() POSTs the comment with an optional parent id", () => {
    service.create(1, "Nice work", 5).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/task/1`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ comment: "Nice work", parent_comment_id: 5 });
    req.flush({ success: true, message: "ok", data: { id: 1 } });
  });

  it("update() PUTs the edited comment text", () => {
    service.update(2, "edited").subscribe();
    const req = httpMock.expectOne(`${baseUrl}/2`);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual({ comment: "edited" });
    req.flush({ success: true, message: "ok", data: null });
  });

  it("remove() DELETEs the comment by id", () => {
    service.remove(2).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/2`);
    expect(req.request.method).toBe("DELETE");
    req.flush({ success: true, message: "ok", data: null });
  });
});
