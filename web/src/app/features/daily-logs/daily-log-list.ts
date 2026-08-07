import { Component, OnInit, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { DailyLogService } from "../../core/services/daily-log.service";
import { ProjectService } from "../../core/services/project.service";
import { TaskService } from "../../core/services/task.service";
import { DailyLog, UserHours } from "../../core/models/daily-log.model";
import { Project } from "../../core/models/project.model";
import { Task } from "../../core/models/task.model";
import { StatCard } from "../../shared/components/stat-card";
import { Icon } from "../../shared/components/icon";
import { Skeleton } from "../../shared/components/skeleton";
import { EmptyState } from "../../shared/components/empty-state";
import { Pagination } from "../../shared/components/pagination";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "app-daily-log-list",
  imports: [ReactiveFormsModule, StatCard, Icon, Skeleton, EmptyState, Pagination],
  templateUrl: "./daily-log-list.html"
})
export class DailyLogList implements OnInit {
  private fb = inject(FormBuilder);
  private dailyLogService = inject(DailyLogService);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private toast = inject(ToastService);

  readonly loading = signal(true);
  readonly logs = signal<DailyLog[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly userHours = signal<UserHours | null>(null);
  readonly showForm = signal(false);
  readonly errorMessage = signal("");

  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);

  readonly filterForm = this.fb.group({
    project_id: [null as number | null],
    from: [""],
    to: [""]
  });

  readonly form = this.fb.group({
    project_id: [null as number | null, [Validators.required]],
    task_id: [null as number | null, [Validators.required]],
    log_date: [new Date().toISOString().slice(0, 10), [Validators.required]],
    hours_worked: [1, [Validators.required, Validators.min(0.5), Validators.max(24)]],
    work_description: ["", [Validators.required, Validators.minLength(3)]],
    work_status: ["In Progress", [Validators.required]]
  });

  ngOnInit(): void {
    this.load();
    this.projectService.list().subscribe((res) => this.projects.set(res.data.items));
    this.dailyLogService.userHours().subscribe((res) => this.userHours.set(res.data));

    this.form.get("project_id")!.valueChanges.subscribe((projectId) => {
      this.form.get("task_id")!.setValue(null);
      this.tasks.set([]);
      if (projectId) {
        this.taskService.list({ project_id: projectId }).subscribe((res) => this.tasks.set(res.data.items));
      }
    });
  }

  load(): void {
    this.loading.set(true);
    const raw = this.filterForm.getRawValue();
    this.dailyLogService
      .list({
        project_id: raw.project_id ?? undefined,
        from: raw.from || undefined,
        to: raw.to || undefined,
        page: this.page()
      })
      .subscribe((res) => {
        this.logs.set(res.data.items);
        this.totalPages.set(res.data.pagination.totalPages);
        this.total.set(res.data.pagination.total);
        this.loading.set(false);
      });
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.filterForm.reset({ project_id: null, from: "", to: "" });
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  toggleForm(): void {
    this.showForm.set(!this.showForm());
    this.errorMessage.set("");
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dailyLogService.create(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.showForm.set(false);
        this.form.reset({ log_date: new Date().toISOString().slice(0, 10), hours_worked: 1, work_status: "In Progress" });
        this.load();
        this.dailyLogService.userHours().subscribe((res) => this.userHours.set(res.data));
        this.toast.success("Log saved");
      },
      error: (err) => {
        const message = err?.error?.message ?? "Could not save log.";
        this.errorMessage.set(message);
        this.toast.error(message);
      }
    });
  }

  remove(id: number): void {
    this.dailyLogService.remove(id).subscribe(() => {
      this.load();
      this.toast.success("Log removed");
    });
  }
}
