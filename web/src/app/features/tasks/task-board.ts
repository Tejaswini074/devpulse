import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { TaskService } from "../../core/services/task.service";
import { ProjectService } from "../../core/services/project.service";
import { UserService, OrgUser } from "../../core/services/user.service";
import { Task, TaskStatus, TASK_STATUSES } from "../../core/models/task.model";
import { Project } from "../../core/models/project.model";
import { Icon } from "../../shared/components/icon";
import { TaskDetail } from "./task-detail";
import { ToastService } from "../../core/services/toast.service";
import { Skeleton } from "../../shared/components/skeleton";

@Component({
  selector: "app-task-board",
  imports: [ReactiveFormsModule, DragDropModule, Icon, TaskDetail, Skeleton],
  templateUrl: "./task-board.html"
})
export class TaskBoard implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  readonly statuses = TASK_STATUSES;
  readonly loading = signal(true);
  readonly projects = signal<Project[]>([]);
  readonly orgUsers = signal<OrgUser[]>([]);
  readonly showForm = signal(false);
  readonly errorMessage = signal("");
  readonly selectedTaskId = signal<number | null>(null);

  private allTasks = signal<Task[]>([]);

  readonly searchText = signal("");
  readonly filterProjectId = signal<number | null>(null);
  readonly filterAssignedTo = signal<number | null>(null);

  readonly columns = computed<Record<TaskStatus, Task[]>>(() => {
    const search = this.searchText().trim().toLowerCase();
    const projectId = this.filterProjectId();
    const assignedTo = this.filterAssignedTo();
    const grouped: Record<TaskStatus, Task[]> = {
      Backlog: [], Todo: [], "In Progress": [], "Code Review": [], Testing: [], Done: [], Blocked: []
    };
    for (const task of this.allTasks()) {
      if (projectId && task.project_id !== projectId) continue;
      if (assignedTo && task.assigned_to !== assignedTo) continue;
      if (search && !task.title.toLowerCase().includes(search)) continue;
      grouped[task.status].push(task);
    }
    return grouped;
  });

  readonly form = this.fb.group({
    project_id: [null as number | null, [Validators.required]],
    assigned_to: [null as number | null, [Validators.required]],
    title: ["", [Validators.required, Validators.minLength(2)]],
    description: [""],
    task_type: ["Task", [Validators.required]],
    priority: ["Medium", [Validators.required]],
    due_date: [""]
  });

  ngOnInit(): void {
    const projectIdParam = this.route.snapshot.queryParamMap.get("project_id");
    this.filterProjectId.set(projectIdParam ? Number(projectIdParam) : null);

    this.projectService.list().subscribe((res) => this.projects.set(res.data.items));
    this.userService.list().subscribe((res) => this.orgUsers.set(res.data.items));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.taskService.list().subscribe((res) => {
      this.allTasks.set(res.data.items);
      this.loading.set(false);
    });
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const task = event.previousContainer.data[event.previousIndex];
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    this.taskService.updateStatus(task.id, newStatus).subscribe({
      next: () => (task.status = newStatus),
      error: (err) => {
        transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex);
        this.toast.error(err?.error?.message ?? "Could not update task status.");
      }
    });
  }

  toggleForm(): void {
    this.showForm.set(!this.showForm());
    this.errorMessage.set("");
  }

  openTask(taskId: number): void {
    this.selectedTaskId.set(taskId);
  }

  closeTask(): void {
    this.selectedTaskId.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.taskService.create(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.showForm.set(false);
        this.form.reset({ task_type: "Task", priority: "Medium" });
        this.load();
        this.toast.success("Task created");
      },
      error: (err) => {
        const message = err?.error?.message ?? "Could not create task.";
        this.errorMessage.set(message);
        this.toast.error(message);
      }
    });
  }

  priorityColor(priority: string): string {
    switch (priority) {
      case "Critical": return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
      case "High": return "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400";
      case "Medium": return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
      default: return "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    }
  }
}
