import { Component, OnInit, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ProjectService } from "../../core/services/project.service";
import { MilestoneService } from "../../core/services/milestone.service";
import { UserService, OrgUser } from "../../core/services/user.service";
import { AuthService } from "../../core/services/auth.service";
import { Project, Milestone } from "../../core/models/project.model";
import { Icon } from "../../shared/components/icon";

@Component({
  selector: "app-project-detail",
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: "./project-detail.html"
})
export class ProjectDetail implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private milestoneService = inject(MilestoneService);
  private userService = inject(UserService);
  protected auth = inject(AuthService);

  readonly loading = signal(true);
  readonly project = signal<Project | null>(null);
  readonly milestones = signal<Milestone[]>([]);
  readonly orgUsers = signal<OrgUser[]>([]);
  readonly showMemberForm = signal(false);
  readonly showMilestoneForm = signal(false);
  readonly errorMessage = signal("");

  readonly canManage = this.auth.hasAnyRole(["Admin", "Super Admin", "Manager"]);

  private projectId = Number(this.route.snapshot.paramMap.get("id"));

  readonly memberForm = this.fb.group({
    user_id: [null as number | null, [Validators.required]],
    member_role: ["Contributor"]
  });

  readonly milestoneForm = this.fb.group({
    title: ["", [Validators.required]],
    description: [""],
    target_date: [""]
  });

  ngOnInit(): void {
    this.loadProject();
    this.loadMilestones();
    this.userService.list().subscribe((res) => this.orgUsers.set(res.data.items));
  }

  loadProject(): void {
    this.loading.set(true);
    this.projectService.getById(this.projectId).subscribe((res) => {
      this.project.set(res.data);
      this.loading.set(false);
    });
  }

  loadMilestones(): void {
    this.milestoneService.listByProject(this.projectId).subscribe((res) => this.milestones.set(res.data));
  }

  memberIds(): Set<number> {
    return new Set((this.project()?.members ?? []).map((m) => m.user_id));
  }

  addMember(): void {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }
    const { user_id, member_role } = this.memberForm.getRawValue();
    this.projectService.addMember(this.projectId, user_id!, member_role ?? undefined).subscribe({
      next: () => {
        this.showMemberForm.set(false);
        this.memberForm.reset({ member_role: "Contributor" });
        this.loadProject();
      },
      error: (err) => this.errorMessage.set(err?.error?.message ?? "Could not add member.")
    });
  }

  removeMember(userId: number): void {
    this.projectService.removeMember(this.projectId, userId).subscribe(() => this.loadProject());
  }

  addMilestone(): void {
    if (this.milestoneForm.invalid) {
      this.milestoneForm.markAllAsTouched();
      return;
    }
    this.milestoneService
      .create({ project_id: this.projectId, ...(this.milestoneForm.getRawValue() as any) })
      .subscribe({
        next: () => {
          this.showMilestoneForm.set(false);
          this.milestoneForm.reset();
          this.loadMilestones();
        },
        error: (err) => this.errorMessage.set(err?.error?.message ?? "Could not add milestone.")
      });
  }

  toggleMilestone(milestone: Milestone): void {
    const nextStatus = milestone.status === "Completed" ? "Pending" : "Completed";
    this.milestoneService.updateStatus(milestone.id, nextStatus).subscribe(() => this.loadMilestones());
  }

  removeMilestone(id: number): void {
    this.milestoneService.remove(id).subscribe(() => this.loadMilestones());
  }
}
