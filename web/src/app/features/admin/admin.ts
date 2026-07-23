import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { UserService, OrgUser } from "../../core/services/user.service";
import { InviteService } from "../../core/services/invite.service";
import { TeamService } from "../../core/services/team.service";
import { ActivityLogService } from "../../core/services/activity-log.service";
import { SettingsService } from "../../core/services/settings.service";
import { CalendarService } from "../../core/services/calendar.service";
import { ToastService } from "../../core/services/toast.service";
import { Team } from "../../core/models/team.model";
import { ActivityLog } from "../../core/models/activity-log.model";
import { WorkCalendarEntry } from "../../core/models/calendar.model";
import { Icon } from "../../shared/components/icon";
import { Tabs, TabItem } from "../../shared/components/tabs";
import { EmptyState } from "../../shared/components/empty-state";
import { Pagination } from "../../shared/components/pagination";

@Component({
  selector: "app-admin",
  imports: [ReactiveFormsModule, Icon, Tabs, EmptyState, Pagination],
  templateUrl: "./admin.html"
})
export class Admin implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private inviteService = inject(InviteService);
  private teamService = inject(TeamService);
  private activityLogService = inject(ActivityLogService);
  private settingsService = inject(SettingsService);
  private calendarService = inject(CalendarService);
  private toast = inject(ToastService);

  readonly tabs: TabItem[] = [
    { id: "people", label: "Users & Teams" },
    { id: "activity", label: "Activity Log" },
    { id: "settings", label: "Settings" },
    { id: "holidays", label: "Holidays" }
  ];
  readonly activeTab = signal("people");

  readonly loading = signal(true);
  readonly users = signal<OrgUser[]>([]);
  readonly teams = signal<Team[]>([]);
  readonly showInviteForm = signal(false);
  readonly showTeamForm = signal(false);
  readonly inviteMessage = signal("");
  readonly inviteError = signal("");
  readonly teamError = signal("");

  readonly userSearch = signal("");
  readonly userRoleFilter = signal("");
  readonly filteredUsers = computed(() => {
    const search = this.userSearch().trim().toLowerCase();
    const role = this.userRoleFilter();
    return this.users().filter((u) => {
      if (role && u.role !== role) return false;
      if (search && !u.name.toLowerCase().includes(search) && !u.email.toLowerCase().includes(search)) return false;
      return true;
    });
  });

  readonly activityLogs = signal<ActivityLog[]>([]);
  readonly activityPage = signal(1);
  readonly activityTotalPages = signal(1);
  readonly activityTotal = signal(0);
  readonly calendarEntries = signal<WorkCalendarEntry[]>([]);
  readonly showHolidayForm = signal(false);

  readonly activityFilterForm = this.fb.group({
    module_name: [""],
    user_id: [null as number | null],
    from: [""],
    to: [""]
  });

  readonly settingsForm = this.fb.group({
    company_name: [""],
    weekly_hours_target: [""],
    weekly_commits_target: [""]
  });

  readonly holidayForm = this.fb.group({
    calendar_date: ["", [Validators.required]],
    holiday_name: ["", [Validators.required]],
    holiday_type: ["Company"]
  });

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
    this.loadSettings();
    this.loadCalendar();
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
    if (tab === "activity" && !this.activityLogs().length) {
      this.loadActivityLogs();
    }
  }

  applyActivityFilters(): void {
    this.activityPage.set(1);
    this.loadActivityLogs();
  }

  clearActivityFilters(): void {
    this.activityFilterForm.reset({ module_name: "", user_id: null, from: "", to: "" });
    this.activityPage.set(1);
    this.loadActivityLogs();
  }

  goToActivityPage(page: number): void {
    this.activityPage.set(page);
    this.loadActivityLogs();
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

  loadActivityLogs(): void {
    const raw = this.activityFilterForm.getRawValue();
    this.activityLogService
      .list({
        module_name: raw.module_name ?? undefined,
        user_id: raw.user_id ?? undefined,
        from: raw.from ?? undefined,
        to: raw.to ?? undefined,
        page: this.activityPage()
      })
      .subscribe((res) => {
        this.activityLogs.set(res.data.items);
        this.activityTotalPages.set(res.data.pagination.totalPages);
        this.activityTotal.set(res.data.pagination.total);
      });
  }

  loadSettings(): void {
    this.settingsService.getAll().subscribe((res) => {
      this.settingsForm.patchValue({
        company_name: res.data.company_name ?? "",
        weekly_hours_target: res.data.weekly_hours_target ?? "",
        weekly_commits_target: res.data.weekly_commits_target ?? ""
      });
    });
  }

  saveSettings(): void {
    const raw = this.settingsForm.getRawValue();
    const payload: Record<string, string> = {};
    if (raw.company_name) payload["company_name"] = raw.company_name;
    if (raw.weekly_hours_target) payload["weekly_hours_target"] = raw.weekly_hours_target;
    if (raw.weekly_commits_target) payload["weekly_commits_target"] = raw.weekly_commits_target;

    this.settingsService.update(payload).subscribe({
      next: () => this.toast.success("Settings saved"),
      error: (err) => this.toast.error(err?.error?.message ?? "Could not save settings.")
    });
  }

  loadCalendar(): void {
    this.calendarService.listByYear(new Date().getFullYear()).subscribe((res) => this.calendarEntries.set(res.data));
  }

  toggleHolidayForm(): void {
    this.showHolidayForm.set(!this.showHolidayForm());
  }

  addHoliday(): void {
    if (this.holidayForm.invalid) {
      this.holidayForm.markAllAsTouched();
      return;
    }
    this.calendarService.create(this.holidayForm.getRawValue() as any).subscribe({
      next: () => {
        this.showHolidayForm.set(false);
        this.holidayForm.reset({ holiday_type: "Company" });
        this.loadCalendar();
        this.toast.success("Holiday added");
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not add holiday.")
    });
  }

  removeHoliday(id: number): void {
    this.calendarService.remove(id).subscribe(() => this.loadCalendar());
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
          this.toast.success(`Invite sent to ${payload.email}`);
        },
        error: (err) => {
          const message = err?.error?.message ?? "Could not send invite.";
          this.inviteError.set(message);
          this.toast.error(message);
        }
      });
  }

  updateUserRole(userId: number, role: string): void {
    this.userService.update(userId, { role }).subscribe(() => {
      this.loadUsers();
      this.toast.success("Role updated");
    });
  }

  updateUserStatus(userId: number, status: string): void {
    this.userService.update(userId, { status }).subscribe(() => {
      this.loadUsers();
      this.toast.success("Status updated");
    });
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
          this.toast.success("Team created");
        },
        error: (err) => {
          const message = err?.error?.message ?? "Could not create team.";
          this.teamError.set(message);
          this.toast.error(message);
        }
      });
  }
}
