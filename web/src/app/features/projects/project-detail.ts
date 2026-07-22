import { Component, OnInit, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ProjectService } from "../../core/services/project.service";
import { MilestoneService } from "../../core/services/milestone.service";
import { SprintService } from "../../core/services/sprint.service";
import { UserService, OrgUser } from "../../core/services/user.service";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../core/services/toast.service";
import { Project, Milestone } from "../../core/models/project.model";
import { Sprint, SprintDetail, SprintStatus } from "../../core/models/sprint.model";
import { Icon } from "../../shared/components/icon";
import { EmptyState } from "../../shared/components/empty-state";
import { Skeleton } from "../../shared/components/skeleton";

@Component({
  selector: "app-project-detail",
  imports: [ReactiveFormsModule, RouterLink, Icon, EmptyState, Skeleton],
  templateUrl: "./project-detail.html"
})
export class ProjectDetail implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private milestoneService = inject(MilestoneService);
  private sprintService = inject(SprintService);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  protected auth = inject(AuthService);

  readonly loading = signal(true);
  readonly project = signal<Project | null>(null);
  readonly milestones = signal<Milestone[]>([]);
  readonly sprints = signal<Sprint[]>([]);
  readonly expandedSprint = signal<SprintDetail | null>(null);
  readonly orgUsers = signal<OrgUser[]>([]);
  readonly showMemberForm = signal(false);
  readonly showMilestoneForm = signal(false);
  readonly showSprintForm = signal(false);
  readonly errorMessage = signal("");

  readonly canManage = this.auth.hasAnyRole(["Admin", "Super Admin", "Manager"]);
  readonly sprintStatusOptions: SprintStatus[] = ["Planned", "Active", "Completed"];

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

  readonly sprintForm = this.fb.group({
    sprint_name: ["", [Validators.required]],
    goal: [""],
    start_date: [""],
    end_date: [""]
  });

  ngOnInit(): void {
    this.loadProject();
    this.loadMilestones();
    this.loadSprints();
    this.userService.list().subscribe((res) => this.orgUsers.set(res.data.items));
  }

  loadSprints(): void {
    this.sprintService.listByProject(this.projectId).subscribe((res) => this.sprints.set(res.data));
  }

  addSprint(): void {
    if (this.sprintForm.invalid) {
      this.sprintForm.markAllAsTouched();
      return;
    }
    this.sprintService
      .create({ project_id: this.projectId, ...(this.sprintForm.getRawValue() as any) })
      .subscribe({
        next: () => {
          this.showSprintForm.set(false);
          this.sprintForm.reset();
          this.loadSprints();
          this.toast.success("Sprint created");
        },
        error: (err) => this.toast.error(err?.error?.message ?? "Could not create sprint.")
      });
  }

  toggleSprintExpand(sprint: Sprint): void {
    if (this.expandedSprint()?.id === sprint.id) {
      this.expandedSprint.set(null);
      return;
    }
    this.sprintService.getById(sprint.id).subscribe((res) => this.expandedSprint.set(res.data));
  }

  changeSprintStatus(sprint: Sprint, status: SprintStatus): void {
    this.sprintService.updateStatus(sprint.id, status).subscribe(() => this.loadSprints());
  }

  removeSprint(id: number): void {
    this.sprintService.remove(id).subscribe(() => {
      this.loadSprints();
      if (this.expandedSprint()?.id === id) {
        this.expandedSprint.set(null);
      }
    });
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
        this.toast.success("Member added");
      },
      error: (err) => {
        const message = err?.error?.message ?? "Could not add member.";
        this.errorMessage.set(message);
        this.toast.error(message);
      }
    });
  }

  removeMember(userId: number): void {
    this.projectService.removeMember(this.projectId, userId).subscribe(() => {
      this.loadProject();
      this.toast.success("Member removed");
    });
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
          this.toast.success("Milestone added");
        },
        error: (err) => {
          const message = err?.error?.message ?? "Could not add milestone.";
          this.errorMessage.set(message);
          this.toast.error(message);
        }
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
