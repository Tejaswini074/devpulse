import { Component, OnInit, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { UserService, OrgUser } from "../../core/services/user.service";
import { InviteService } from "../../core/services/invite.service";
import { TeamService } from "../../core/services/team.service";
import { Team } from "../../core/models/team.model";
import { Icon } from "../../shared/components/icon";

@Component({
  selector: "app-admin",
  imports: [ReactiveFormsModule, Icon],
  templateUrl: "./admin.html"
})
export class Admin implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private inviteService = inject(InviteService);
  private teamService = inject(TeamService);

  readonly loading = signal(true);
  readonly users = signal<OrgUser[]>([]);
  readonly teams = signal<Team[]>([]);
  readonly showInviteForm = signal(false);
  readonly showTeamForm = signal(false);
  readonly inviteMessage = signal("");
  readonly inviteError = signal("");
  readonly teamError = signal("");

  readonly inviteForm = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
    role: ["Developer", [Validators.required]],
    team_id: [null as number | null],
    designation: [""]
  });

  readonly teamForm = this.fb.group({
    team_name: ["", [Validators.required, Validators.minLength(2)]],
    description: [""],
    manager_id: [null as number | null]
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadTeams();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.list().subscribe((res) => {
      this.users.set(res.data.items);
      this.loading.set(false);
    });
  }

  loadTeams(): void {
    this.teamService.list().subscribe((res) => this.teams.set(res.data.items));
  }

  toggleInviteForm(): void {
    this.showInviteForm.set(!this.showInviteForm());
    this.inviteError.set("");
    this.inviteMessage.set("");
  }

  sendInvite(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    const payload = this.inviteForm.getRawValue();
    this.inviteService
      .inviteUser({
        name: payload.name!,
        email: payload.email!,
        role: payload.role!,
        team_id: payload.team_id ?? undefined,
        designation: payload.designation ?? undefined
      })
      .subscribe({
        next: () => {
          this.inviteMessage.set(`Invite sent to ${payload.email}.`);
          this.inviteForm.reset({ role: "Developer" });
        },
        error: (err) => this.inviteError.set(err?.error?.message ?? "Could not send invite.")
      });
  }

  updateUserRole(userId: number, role: string): void {
    this.userService.update(userId, { role }).subscribe(() => this.loadUsers());
  }

  updateUserStatus(userId: number, status: string): void {
    this.userService.update(userId, { status }).subscribe(() => this.loadUsers());
  }

  toggleTeamForm(): void {
    this.showTeamForm.set(!this.showTeamForm());
    this.teamError.set("");
  }

  createTeam(): void {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    const payload = this.teamForm.getRawValue();
    this.teamService
      .create({
        team_name: payload.team_name!,
        description: payload.description ?? undefined,
        manager_id: payload.manager_id ?? undefined
      })
      .subscribe({
        next: () => {
          this.showTeamForm.set(false);
          this.teamForm.reset();
          this.loadTeams();
        },
        error: (err) => this.teamError.set(err?.error?.message ?? "Could not create team.")
      });
  }
}
