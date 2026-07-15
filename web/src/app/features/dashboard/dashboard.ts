import { Component, OnInit, inject, signal } from "@angular/core";
import { DashboardService } from "../../core/services/dashboard.service";
import { AuthService } from "../../core/services/auth.service";
import { StatCard } from "../../shared/components/stat-card";
import { WeeklyChart } from "../../shared/components/weekly-chart";
import { DashboardOverview, TeamOverviewRow, WeeklyReport } from "../../core/models/dashboard.model";

@Component({
  selector: "app-dashboard",
  imports: [StatCard, WeeklyChart],
  templateUrl: "./dashboard.html"
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  protected auth = inject(AuthService);

  readonly loading = signal(true);
  readonly overview = signal<DashboardOverview | null>(null);
  readonly weeklyReport = signal<WeeklyReport | null>(null);
  readonly teamOverview = signal<TeamOverviewRow[]>([]);

  readonly isManager = this.auth.hasAnyRole(["Admin", "Super Admin", "Manager"]);

  ngOnInit(): void {
    this.dashboardService.getMine().subscribe((res) => this.overview.set(res.data));
    this.dashboardService.getWeeklyReport().subscribe((res) => {
      this.weeklyReport.set(res.data);
      this.loading.set(false);
    });

    if (this.isManager) {
      this.dashboardService.getTeam().subscribe((res) => this.teamOverview.set(res.data));
    }
  }
}
