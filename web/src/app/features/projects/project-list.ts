import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ProjectService } from "../../core/services/project.service";
import { UserService, OrgUser } from "../../core/services/user.service";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../core/services/toast.service";
import { Project } from "../../core/models/project.model";
import { Icon } from "../../shared/components/icon";
import { Skeleton } from "../../shared/components/skeleton";
import { EmptyState } from "../../shared/components/empty-state";

@Component({
  selector: "app-project-list",
  imports: [ReactiveFormsModule, RouterLink, Icon, Skeleton, EmptyState],
  templateUrl: "./project-list.html"
})
export class ProjectList implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  protected auth = inject(AuthService);

  readonly loading = signal(true);
  readonly projects = signal<Project[]>([]);
  readonly managers = signal<OrgUser[]>([]);
  readonly showForm = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal("");

  readonly searchText = signal("");
  readonly statusFilter = signal("");
  readonly filteredProjects = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const status = this.statusFilter();
    return this.projects().filter((p) => {
      if (status && p.status !== status) return false;
      if (search && !p.project_name.toLowerCase().includes(search)) return false;
      return true;
    });
  });

  readonly canManage = this.auth.hasAnyRole(["Admin", "Super Admin", "Manager"]);

  readonly form = this.fb.group({
    project_name: ["", [Validators.required, Validators.minLength(2)]],
    description: [""],
    project_type: ["Internal", [Validators.required]],
    client_name: [""],
    priority: ["Medium", [Validators.required]],
    project_manager: [null as number | null, [Validators.required]],
    start_date: [""],
    end_date: [""]
  });

  ngOnInit(): void {
    this.load();
    this.userService.list().subscribe((res) => this.managers.set(res.data.items));
  }

  load(): void {
    this.loading.set(true);
    this.projectService.list().subscribe((res) => {
      this.projects.set(res.data.items);
      this.loading.set(false);
    });
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

    this.submitting.set(true);
    this.errorMessage.set("");

    this.projectService.create(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.form.reset({ project_type: "Internal", priority: "Medium" });
        this.load();
        this.toast.success("Project created");
      },
      error: (err) => {
        this.submitting.set(false);
        const message = err?.error?.message ?? "Could not create project.";
        this.errorMessage.set(message);
        this.toast.error(message);
      }
    });
  }

  statusColor(status: string): string {
    switch (status) {
      case "Active": return "bg-green-50 text-green-700 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
      case "Completed": return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "On Hold": return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
      default: return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  }
}
