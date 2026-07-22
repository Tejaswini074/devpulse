import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { environment } from "../../../environments/environment";
import { TaskDetail } from "./task-detail";
import { Task } from "../../core/models/task.model";

const USER_KEY = "devpulse_user";

function setUser(id: number, role: string): void {
  localStorage.setItem(USER_KEY, JSON.stringify({ id, name: "Test User", email: "t@devpulse.com", role, organization_id: 1, team_id: 1 }));
}

const TASK: Task = {
  id: 42,
  organization_id: 1,
  task_code: "TASK-42",
  project_id: 7,
  sprint_id: null,
  assigned_to: 1,
  title: "Fix login bug",
  description: "Login fails on Safari",
  task_type: "Bug",
  priority: "High",
  severity: "High",
  status: "In Progress",
  progress: 40,
  estimated_hours: 4,
  actual_hours: 1,
  due_date: null,
  created_at: "2026-07-01T00:00:00Z"
};

describe("TaskDetail", () => {
  let httpMock: HttpTestingController;
  const tasksUrl = `${environment.apiUrl}/tasks`;
  const commentsUrl = `${environment.apiUrl}/comments`;
  const attachmentsUrl = `${environment.apiUrl}/attachments`;
  const sprintsUrl = `${environment.apiUrl}/sprints`;

  beforeEach(async () => {
    localStorage.clear();
    setUser(1, "Developer");
    await TestBed.configureTestingModule({
      imports: [TaskDetail],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function createAndLoad() {
    const fixture = TestBed.createComponent(TaskDetail);
    const component = fixture.componentInstance;
    component.taskId = 42;
    component.ngOnChanges();

    httpMock.expectOne(`${tasksUrl}/42`).flush({ success: true, message: "ok", data: TASK });
    httpMock.expectOne(`${commentsUrl}/task/42`).flush({ success: true, message: "ok", data: [] });
    httpMock.expectOne(`${attachmentsUrl}/Task/42`).flush({ success: true, message: "ok", data: [] });
    httpMock.expectOne(`${sprintsUrl}/project/7`).flush({ success: true, message: "ok", data: [] });

    return { fixture, component };
  }

  it("is closed when no taskId is set", () => {
    const fixture = TestBed.createComponent(TaskDetail);
    expect(fixture.componentInstance.open).toBe(false);
  });

  it("loads the task, its comments, attachments, and its project's sprints on change", () => {
    const { component } = createAndLoad();

    expect(component.open).toBe(true);
    expect(component.task()?.title).toBe("Fix login bug");
    expect(component.loading()).toBe(false);
  });

  it("splits comments into top-level and replies", () => {
    const fixture = TestBed.createComponent(TaskDetail);
    const component = fixture.componentInstance;
    component.taskId = 42;
    component.ngOnChanges();
    httpMock.expectOne(`${tasksUrl}/42`).flush({ success: true, message: "ok", data: TASK });
    httpMock.expectOne(`${commentsUrl}/task/42`).flush({
      success: true, message: "ok",
      data: [
        { id: 1, task_id: 42, user_id: 1, comment: "Top comment", parent_comment_id: null, created_at: "2026-07-01T00:00:00Z" },
        { id: 2, task_id: 42, user_id: 2, comment: "A reply", parent_comment_id: 1, created_at: "2026-07-01T01:00:00Z" }
      ]
    });
    httpMock.expectOne(`${attachmentsUrl}/Task/42`).flush({ success: true, message: "ok", data: [] });
    httpMock.expectOne(`${sprintsUrl}/project/7`).flush({ success: true, message: "ok", data: [] });

    expect(component.topLevelComments().length).toBe(1);
    expect(component.repliesFor(1).length).toBe(1);
    expect(component.isOwnComment(component.comments()[0])).toBe(true);
    expect(component.isOwnComment(component.comments()[1])).toBe(false);
  });

  it("changeStatus updates the task status and emits updated", () => {
    const { fixture, component } = createAndLoad();
    const updatedSpy = spyOn(component.updated, "emit");

    component.changeStatus("Done");

    const req = httpMock.expectOne(`${tasksUrl}/42/status`);
    expect(req.request.body).toEqual({ status: "Done" });
    req.flush({ success: true, message: "ok", data: null });

    expect(component.task()?.status).toBe("Done");
    expect(updatedSpy).toHaveBeenCalled();
  });

  it("submitComment posts and reloads the comment list, then clears the input", () => {
    const { component } = createAndLoad();
    component.newComment = "Looks good";

    component.submitComment();

    const req = httpMock.expectOne(`${commentsUrl}/task/42`);
    expect(req.request.body).toEqual({ comment: "Looks good", parent_comment_id: undefined });
    req.flush({ success: true, message: "ok", data: { id: 5 } });

    httpMock.expectOne(`${commentsUrl}/task/42`).flush({ success: true, message: "ok", data: [] });

    expect(component.newComment).toBe("");
  });

  it("does not submit an empty comment", () => {
    const { component } = createAndLoad();
    component.newComment = "   ";

    component.submitComment();

    expect(component.newComment).toBe("   ");
    httpMock.expectNone((r) => r.method === "POST" && r.url === `${commentsUrl}/task/42`);
  });

  it("onFileSelected uploads the chosen file and reloads attachments", () => {
    const { component } = createAndLoad();
    const file = new File(["data"], "spec.pdf", { type: "application/pdf" });
    const input = document.createElement("input");
    input.type = "file";
    Object.defineProperty(input, "files", { value: [file] });

    component.onFileSelected({ target: input } as unknown as Event);

    expect(component.uploading()).toBe(true);
    const req = httpMock.expectOne(`${attachmentsUrl}/Task/42`);
    expect(req.request.method).toBe("POST");
    req.flush({ success: true, message: "ok", data: { id: 3 } });

    httpMock.expectOne(`${attachmentsUrl}/Task/42`).flush({ success: true, message: "ok", data: [] });

    expect(component.uploading()).toBe(false);
  });

  it("formatSize renders bytes, KB, and MB appropriately", () => {
    const { component } = createAndLoad();

    expect(component.formatSize(null)).toBe("");
    expect(component.formatSize(500)).toBe("500 B");
    expect(component.formatSize(2048)).toBe("2 KB");
    expect(component.formatSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("canManage reflects the current user's role", () => {
    const { component } = createAndLoad();
    expect(component.canManage()).toBe(false);
  });
});
