import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { environment } from "../../../environments/environment";
import { DailyLogList } from "./daily-log-list";

describe("DailyLogList", () => {
  let httpMock: HttpTestingController;
  const logsUrl = `${environment.apiUrl}/daily-logs`;
  const projectsUrl = `${environment.apiUrl}/projects`;
  const userHoursUrl = `${environment.apiUrl}/daily-logs/user-hours`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyLogList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function createAndLoad() {
    const fixture = TestBed.createComponent(DailyLogList);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url === logsUrl).flush({
      success: true, message: "ok",
      data: { items: [{ id: 1, log_date: "2026-07-20", hours_worked: 4 }], pagination: { page: 1, pageSize: 20, total: 45, totalPages: 3 } }
    });
    httpMock.expectOne((r) => r.url === projectsUrl).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
    httpMock.expectOne(userHoursUrl).flush({ success: true, message: "ok", data: { todayHours: 2, weeklyHours: 10, monthlyHours: 40 } });

    return { fixture, component };
  }

  it("loads logs and stores pagination meta", () => {
    const { component } = createAndLoad();

    expect(component.logs().length).toBe(1);
    expect(component.totalPages()).toBe(3);
    expect(component.total()).toBe(45);
    expect(component.loading()).toBe(false);
  });

  it("applyFilters sends project/date filters and resets to page 1", () => {
    const { component } = createAndLoad();
    component.filterForm.patchValue({ project_id: 3, from: "2026-07-01", to: "2026-07-31" });
    component.page.set(2);

    component.applyFilters();

    const req = httpMock.expectOne((r) => r.url === logsUrl);
    expect(req.request.params.get("project_id")).toBe("3");
    expect(req.request.params.get("from")).toBe("2026-07-01");
    expect(req.request.params.get("to")).toBe("2026-07-31");
    expect(req.request.params.get("page")).toBe("1");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });

    expect(component.page()).toBe(1);
  });

  it("clearFilters resets the form and reloads unfiltered", () => {
    const { component } = createAndLoad();
    component.filterForm.patchValue({ project_id: 3 });

    component.clearFilters();

    const req = httpMock.expectOne((r) => r.url === logsUrl);
    expect(req.request.params.has("project_id")).toBe(false);
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });

    expect(component.filterForm.value.project_id).toBeNull();
  });

  it("goToPage requests the given page", () => {
    const { component } = createAndLoad();

    component.goToPage(2);

    const req = httpMock.expectOne((r) => r.url === logsUrl);
    expect(req.request.params.get("page")).toBe("2");
    req.flush({ success: true, message: "ok", data: { items: [], pagination: { page: 2, pageSize: 20, total: 45, totalPages: 3 } } });

    expect(component.page()).toBe(2);
  });
});
