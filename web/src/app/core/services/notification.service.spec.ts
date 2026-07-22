import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { NotificationService } from "./notification.service";

describe("NotificationService", () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/notifications`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("unreadCount() GETs the unread-count endpoint", () => {
    service.unreadCount().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/unread-count`);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: { count: 3 } });
  });

  it("markRead() PATCHes the notification's read sub-resource", () => {
    service.markRead(5).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/5/read`);
    expect(req.request.method).toBe("PATCH");
    req.flush({ success: true, message: "ok", data: null });
  });

  it("markAllRead() PATCHes the read-all endpoint", () => {
    service.markAllRead().subscribe();
    const req = httpMock.expectOne(`${baseUrl}/read-all`);
    expect(req.request.method).toBe("PATCH");
    req.flush({ success: true, message: "ok", data: null });
  });

  it("list() forwards the unread filter as a query param", () => {
    service.list({ unread: true }).subscribe();
    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.params.get("unread")).toBe("true");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
  });
});
