import { Component, OnInit, inject, signal } from "@angular/core";
import { DashboardService } from "../../core/services/dashboard.service";
import { WeeklyReport } from "../../core/models/dashboard.model";
import { WeeklyChart } from "../../shared/components/weekly-chart";
import { Icon } from "../../shared/components/icon";
import { Skeleton } from "../../shared/components/skeleton";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "app-reports",
  imports: [WeeklyChart, Icon, Skeleton],
  templateUrl: "./reports.html"
})
export class Reports implements OnInit {
  private dashboardService = inject(DashboardService);
  private toast = inject(ToastService);

  readonly loading = signal(true);
  readonly report = signal<WeeklyReport | null>(null);
  readonly exporting = signal(false);

  ngOnInit(): void {
    this.dashboardService.getWeeklyReport().subscribe((res) => {
      this.report.set(res.data);
      this.loading.set(false);
    });
  }

  export(): void {
    this.exporting.set(true);
    this.dashboardService.downloadCsv().subscribe({
      next: (blob) => {
        this.exporting.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `devpulse-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success("Report exported");
      },
      error: () => {
        this.exporting.set(false);
        this.toast.error("Could not export report.");
      }
    });
  }
}
