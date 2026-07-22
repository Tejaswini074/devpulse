import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { environment } from "../../../environments/environment";
import { NotificationBell } from "./notification-bell";

describe("NotificationBell", () => {
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/notifications`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationBell],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function createAndInit() {
    const fixture = TestBed.createComponent(NotificationBell);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne(`${baseUrl}/unread-count`).flush({ success: true, message: "ok", data: { count: 2 } });
    return { fixture, component };
  }

  it("loads the unread count on init", () => {
    const { component } = createAndInit();
    expect(component.unreadCount()).toBe(2);
  });

  it("fetches the notification list only when opened", () => {
    const { component } = createAndInit();
    httpMock.expectNone((r) => r.url === baseUrl);

    component.toggle();

    expect(component.open()).toBe(true);
    const req = httpMock.expectOne((r) => r.url === baseUrl);
    req.flush({
      success: true,
      message: "ok",
      data: { items: [{ id: 1, title: "Task assigned", message: "You were assigned a task", is_read: 0, created_at: "2026-07-20T00:00:00Z" }], pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 } }
    });

    expect(component.notifications().length).toBe(1);
  });

  it("markAllRead clears unread count and marks all notifications read", () => {
    const { component } = createAndInit();
    component.notifications.set([
      { id: 1, title: "A", message: "a", is_read: 0, created_at: "2026-07-20T00:00:00Z" } as any
    ]);

    component.markAllRead();
    httpMock.expectOne(`${baseUrl}/read-all`).flush({ success: true, message: "ok", data: null });

    expect(component.unreadCount()).toBe(0);
    expect(component.notifications()[0].is_read).toBe(1);
  });

  it("openNotification marks an unread notification read, decrements the count, and closes the panel", () => {
    const { component } = createAndInit();
    component.open.set(true);
    component.notifications.set([
      { id: 5, title: "A", message: "a", is_read: 0, created_at: "2026-07-20T00:00:00Z" } as any
    ]);

    component.openNotification(component.notifications()[0]);
    httpMock.expectOne(`${baseUrl}/5/read`).flush({ success: true, message: "ok", data: null });

    expect(component.unreadCount()).toBe(1);
    expect(component.notifications()[0].is_read).toBe(1);
    expect(component.open()).toBe(false);
  });

  it("openNotification does not call markRead again for an already-read notification", () => {
    const { component } = createAndInit();
    component.notifications.set([
      { id: 5, title: "A", message: "a", is_read: 1, created_at: "2026-07-20T00:00:00Z" } as any
    ]);

    component.openNotification(component.notifications()[0]);

    expect(component.open()).toBe(false);
    httpMock.expectNone(`${baseUrl}/5/read`);
  });
});
