import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { environment } from "../../../environments/environment";
import { TaskBoard } from "./task-board";
import { Task } from "../../core/models/task.model";

function buildTask(overrides: Partial<Task>): Task {
  return {
    id: 1,
    organization_id: 2,
    task_code: "TSK-00001",
    project_id: 1,
    assigned_to: 1,
    title: "Sample task",
    description: null,
    task_type: "Task",
    priority: "Medium",
    severity: "Medium",
    status: "Todo",
    progress: 0,
    estimated_hours: null,
    actual_hours: 0,
    due_date: null,
    created_at: "2026-07-01",
    ...overrides
  };
}

describe("TaskBoard", () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function createAndLoad(tasks: Task[]) {
    const fixture = TestBed.createComponent(TaskBoard);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url === `${environment.apiUrl}/projects`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
    httpMock.expectOne((r) => r.url === `${environment.apiUrl}/users`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
    httpMock.expectOne((r) => r.url === `${environment.apiUrl}/tasks`).flush({ success: true, message: "ok", data: { items: tasks, pagination: { page: 1, pageSize: 200, total: tasks.length, totalPages: 1 } } });

    return component;
  }

  it("groups loaded tasks into their status column", () => {
    const component = createAndLoad([
      buildTask({ id: 1, status: "Todo" }),
      buildTask({ id: 2, status: "In Progress" }),
      buildTask({ id: 3, status: "Done" })
    ]);

    expect(component.columns()["Todo"].map((t) => t.id)).toEqual([1]);
    expect(component.columns()["In Progress"].map((t) => t.id)).toEqual([2]);
    expect(component.columns()["Done"].map((t) => t.id)).toEqual([3]);
    expect(component.columns()["Testing"]).toEqual([]);
    expect(component.loading()).toBe(false);
  });

  it("reorders within the same column without calling the API", () => {
    const component = createAndLoad([buildTask({ id: 1 }), buildTask({ id: 2 })]);
    const todoColumn = component.columns()["Todo"];
    // Same CdkDropList on both sides, as CDK does for a reorder within one column
    // (drop() checks previousContainer === container by reference).
    const sameContainer = { data: todoColumn };

    component.drop(
      {
        previousContainer: sameContainer,
        container: sameContainer,
        previousIndex: 0,
        currentIndex: 1
      } as any,
      "Todo"
    );

    expect(todoColumn.map((t) => t.id)).toEqual([2, 1]);
    httpMock.expectNone(`${environment.apiUrl}/tasks/1/status`);
  });

  it("moving a card to another column calls updateStatus and updates the task on success", () => {
    const component = createAndLoad([buildTask({ id: 1, status: "Todo" })]);
    const todoColumn = component.columns()["Todo"];
    const inProgressColumn = component.columns()["In Progress"];

    component.drop(
      {
        previousContainer: { data: todoColumn },
        container: { data: inProgressColumn },
        previousIndex: 0,
        currentIndex: 0
      } as any,
      "In Progress"
    );

    expect(inProgressColumn.map((t) => t.id)).toEqual([1]);
    expect(todoColumn.length).toBe(0);

    const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1/status`);
    expect(req.request.body).toEqual({ status: "In Progress" });
    req.flush({ success: true, message: "ok", data: null });

    expect(inProgressColumn[0].status).toBe("In Progress");
  });

  it("reverts the move back to the original column when updateStatus fails", () => {
    const component = createAndLoad([buildTask({ id: 1, status: "Todo" })]);
    const todoColumn = component.columns()["Todo"];
    const doneColumn = component.columns()["Done"];

    component.drop(
      {
        previousContainer: { data: todoColumn },
        container: { data: doneColumn },
        previousIndex: 0,
        currentIndex: 0
      } as any,
      "Done"
    );

    const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1/status`);
    req.flush({ success: false, message: "Forbidden" }, { status: 403, statusText: "Forbidden" });

    expect(doneColumn.length).toBe(0);
    expect(todoColumn.map((t) => t.id)).toEqual([1]);
    expect(todoColumn[0].status).toBe("Todo");
  });

  it("searchText filters the board by task title, case-insensitively", () => {
    const component = createAndLoad([
      buildTask({ id: 1, title: "Fix login bug", status: "Todo" }),
      buildTask({ id: 2, title: "Write onboarding docs", status: "Todo" })
    ]);

    component.searchText.set("LOGIN");

    expect(component.columns()["Todo"].map((t) => t.id)).toEqual([1]);
  });

  it("filterProjectId narrows the board to a single project", () => {
    const component = createAndLoad([
      buildTask({ id: 1, project_id: 1, status: "Todo" }),
      buildTask({ id: 2, project_id: 2, status: "Todo" })
    ]);

    component.filterProjectId.set(2);

    expect(component.columns()["Todo"].map((t) => t.id)).toEqual([2]);
  });

  it("filterAssignedTo narrows the board to one assignee", () => {
    const component = createAndLoad([
      buildTask({ id: 1, assigned_to: 10, status: "Todo" }),
      buildTask({ id: 2, assigned_to: 20, status: "Todo" })
    ]);

    component.filterAssignedTo.set(20);

    expect(component.columns()["Todo"].map((t) => t.id)).toEqual([2]);
  });

  it("combines search, project, and assignee filters", () => {
    const component = createAndLoad([
      buildTask({ id: 1, project_id: 1, assigned_to: 10, title: "Fix login bug", status: "Todo" }),
      buildTask({ id: 2, project_id: 1, assigned_to: 20, title: "Fix login bug", status: "Todo" }),
      buildTask({ id: 3, project_id: 2, assigned_to: 10, title: "Fix login bug", status: "Todo" })
    ]);

    component.searchText.set("login");
    component.filterProjectId.set(1);
    component.filterAssignedTo.set(10);

    expect(component.columns()["Todo"].map((t) => t.id)).toEqual([1]);
  });

  it("seeds filterProjectId from the project_id route query param", async () => {
    await TestBed.resetTestingModule().configureTestingModule({
      imports: [TaskBoard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ project_id: "5" }) } } }
      ]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(TaskBoard);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === `${environment.apiUrl}/projects`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
    httpMock.expectOne((r) => r.url === `${environment.apiUrl}/users`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
    httpMock.expectOne((r) => r.url === `${environment.apiUrl}/tasks`).flush({ success: true, message: "ok", data: { items: [], pagination: { page: 1, pageSize: 200, total: 0, totalPages: 0 } } });

    expect(fixture.componentInstance.filterProjectId()).toBe(5);
  });
});
