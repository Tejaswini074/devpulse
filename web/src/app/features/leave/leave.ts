import { Component, OnInit, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { LeaveService } from "../../core/services/leave.service";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../core/services/toast.service";
import { LeaveRequest } from "../../core/models/leave.model";
import { Icon } from "../../shared/components/icon";
import { Tabs, TabItem } from "../../shared/components/tabs";
import { Skeleton } from "../../shared/components/skeleton";
import { EmptyState } from "../../shared/components/empty-state";

@Component({
  selector: "app-leave",
  imports: [ReactiveFormsModule, Icon, Tabs, Skeleton, EmptyState],
  templateUrl: "./leave.html"
})
export class LeavePage implements OnInit {
  private fb = inject(FormBuilder);
  private leaveService = inject(LeaveService);
  private toast = inject(ToastService);
  protected auth = inject(AuthService);

  readonly canApprove = this.auth.hasAnyRole(["Admin", "Super Admin", "Manager"]);
  readonly activeTab = signal("mine");
  readonly loading = signal(true);
  readonly myRequests = signal<LeaveRequest[]>([]);
  readonly teamRequests = signal<LeaveRequest[]>([]);
  readonly showForm = signal(false);

  readonly tabs: TabItem[] = this.canApprove
    ? [{ id: "mine", label: "My Leave" }, { id: "team", label: "Team Requests" }]
    : [{ id: "mine", label: "My Leave" }];

  readonly form = this.fb.group({
    leave_type: ["Casual", [Validators.required]],
    start_date: ["", [Validators.required]],
    end_date: ["", [Validators.required]],
    reason: [""]
  });

  ngOnInit(): void {
    this.loadMine();
    if (this.canApprove) {
      this.loadTeam();
    }
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  loadMine(): void {
    this.loading.set(true);
    this.leaveService.listMine().subscribe((res) => {
      this.myRequests.set(res.data.items);
      this.loading.set(false);
    });
  }

  loadTeam(): void {
    this.leaveService.listTeam().subscribe((res) => this.teamRequests.set(res.data.items));
  }

  toggleForm(): void {
    this.showForm.set(!this.showForm());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.leaveService.create(this.form.getRawValue() as any).subscribe({
      next: (res) => {
        this.showForm.set(false);
        this.form.reset({ leave_type: "Casual" });
        this.loadMine();
        this.toast.success(`Leave request submitted (${res.data.total_days} day(s))`);
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not submit leave request.")
    });
  }

  cancel(id: number): void {
    this.leaveService.cancel(id).subscribe({
      next: () => {
        this.loadMine();
        this.toast.success("Leave request cancelled");
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not cancel request.")
    });
  }

  decide(id: number, status: "Approved" | "Rejected"): void {
    this.leaveService.updateStatus(id, status).subscribe({
      next: () => {
        this.loadTeam();
        this.toast.success(`Request ${status.toLowerCase()}`);
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not update request.")
    });
  }

  statusColor(status: string): string {
    switch (status) {
      case "Approved": return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400";
      case "Rejected": return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
      case "Cancelled": return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
      default: return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
    }
  }
}
