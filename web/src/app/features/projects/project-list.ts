import { Component, OnInit, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ProjectService } from "../../core/services/project.service";
import { UserService, OrgUser } from "../../core/services/user.service";
import { AuthService } from "../../core/services/auth.service";
import { Project } from "../../core/models/project.model";
import { Icon } from "../../shared/components/icon";

@Component({
  selector: "app-project-list",
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: "./project-list.html"
})
export class ProjectList implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private userService = inject(UserService);
  protected auth = inject(AuthService);

  readonly loading = signal(true);
  readonly projects = signal<Project[]>([]);
  readonly managers = signal<OrgUser[]>([]);
  readonly showForm = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal("");

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
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message ?? "Could not create project.");
      }
    });
  }

  statusColor(status: string): string {
    switch (status) {
      case "Active": return "bg-green-50 text-green-700 border-green-100";
      case "Completed": return "bg-blue-50 text-blue-700 border-blue-100";
      case "On Hold": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }
}
