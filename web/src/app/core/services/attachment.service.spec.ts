import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { AttachmentService } from "./attachment.service";

describe("AttachmentService", () => {
  let service: AttachmentService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/attachments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AttachmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("listByRecord() GETs attachments scoped to module + record", () => {
    service.listByRecord("Task", 1).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/Task/1`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: [] });
  });

  it("upload() POSTs a multipart form containing the file", () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    service.upload("Task", 1, file).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/Task/1`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get("file")).toBe(file);
    req.flush({ success: true, message: "ok", data: { id: 1 } });
  });

  it("download() requests a blob response type", () => {
    service.download(1).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/1/download`);
    expect(req.request.responseType).toBe("blob");
    req.flush(new Blob(["hello"]));
  });

  it("remove() DELETEs the attachment by id", () => {
    service.remove(1).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe("DELETE");
    req.flush({ success: true, message: "ok", data: null });
  });
});
