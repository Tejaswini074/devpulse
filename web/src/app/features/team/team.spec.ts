import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { environment } from "../../../environments/environment";
import { TeamPage } from "./team";

describe("TeamPage", () => {
  let httpMock: HttpTestingController;
  const teamsUrl = `${environment.apiUrl}/teams`;
  const teamOverviewUrl = `${environment.apiUrl}/dashboard/team`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function createAndLoad() {
    const fixture = TestBed.createComponent(TeamPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url === teamsUrl).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 100, total: 0, totalPages: 0 } } });
    httpMock.expectOne((r) => r.url === teamOverviewUrl).flush({
      success: true, message: "ok",
      data: [
        { user_id: 1, name: "Rahul Sharma", email: "rahul@devpulse.com", hours: 38, commits: 12, completed_tasks: 5, score: 80 },
        { user_id: 2, name: "Priya Patel", email: "priya@devpulse.com", hours: 40, commits: 20, completed_tasks: 8, score: 95 }
      ]
    });

    return { fixture, component };
  }

  it("filteredOverview returns everyone when there is no search text", () => {
    const { component } = createAndLoad();
    expect(component.filteredOverview().length).toBe(2);
  });

  it("filteredOverview matches by name or email, case-insensitively", () => {
    const { component } = createAndLoad();

    component.searchText.set("priya");
    expect(component.filteredOverview().map((r) => r.user_id)).toEqual([2]);

    component.searchText.set("RAHUL@DEVPULSE.COM");
    expect(component.filteredOverview().map((r) => r.user_id)).toEqual([1]);
  });

  it("onTeamChange re-requests the team overview scoped to the chosen team", () => {
    const { component } = createAndLoad();

    component.onTeamChange("3");

    const req = httpMock.expectOne((r) => r.url === teamOverviewUrl);
    expect(req.request.params.get("team_id")).toBe("3");
    req.flush({ success: true, message: "ok", data: [] });

    expect(component.selectedTeamId()).toBe(3);
  });
});
