import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { environment } from "../../../environments/environment";
import { ProjectList } from "./project-list";

const USER_KEY = "devpulse_user";

describe("ProjectList", () => {
  let httpMock: HttpTestingController;
  const projectsUrl = `${environment.apiUrl}/projects`;
  const usersUrl = `${environment.apiUrl}/users`;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 1, name: "Test", email: "t@devpulse.com", role: "Developer", organization_id: 1, team_id: 1 }));
    await TestBed.configureTestingModule({
      imports: [ProjectList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function createAndLoad() {
    const fixture = TestBed.createComponent(ProjectList);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url === projectsUrl).flush({
      success: true, message: "ok",
      data: {
        items: [
          { id: 1, project_name: "Mobile Revamp", project_code: "P-1", status: "Active", progress: 40 },
          { id: 2, project_name: "Training Management System", project_code: "P-2", status: "Completed", progress: 100 },
          { id: 3, project_name: "Internal Tools", project_code: "P-3", status: "Active", progress: 10 }
        ],
        pagination: { page: 1, pageSize: 20, total: 3, totalPages: 1 }
      }
    });
    httpMock.expectOne((r) => r.url === usersUrl).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 100, total: 0, totalPages: 0 } } });

    return { fixture, component };
  }

  it("filteredProjects matches project name case-insensitively", () => {
    const { component } = createAndLoad();

    component.searchText.set("mobile");
    expect(component.filteredProjects().map((p) => p.id)).toEqual([1]);
  });

  it("filteredProjects narrows by status", () => {
    const { component } = createAndLoad();

    component.statusFilter.set("Completed");
    expect(component.filteredProjects().map((p) => p.id)).toEqual([2]);
  });

  it("filteredProjects combines search and status filters", () => {
    const { component } = createAndLoad();

    component.searchText.set("internal");
    component.statusFilter.set("Active");
    expect(component.filteredProjects().map((p) => p.id)).toEqual([3]);
  });

  it("returns every project when no filters are set", () => {
    const { component } = createAndLoad();
    expect(component.filteredProjects().length).toBe(3);
  });
});
