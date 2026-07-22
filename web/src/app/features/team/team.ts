import { Component, OnInit, inject, signal } from "@angular/core";
import { DashboardService } from "../../core/services/dashboard.service";
import { TeamService } from "../../core/services/team.service";
import { TeamOverviewRow } from "../../core/models/dashboard.model";
import { Team } from "../../core/models/team.model";
import { Skeleton } from "../../shared/components/skeleton";
import { EmptyState } from "../../shared/components/empty-state";

@Component({
  selector: "app-team",
  imports: [Skeleton, EmptyState],
  templateUrl: "./team.html"
})
export class TeamPage implements OnInit {
  private dashboardService = inject(DashboardService);
  private teamService = inject(TeamService);

  readonly loading = signal(true);
  readonly overview = signal<TeamOverviewRow[]>([]);
  readonly teams = signal<Team[]>([]);
  readonly selectedTeamId = signal<number | null>(null);

  ngOnInit(): void {
    this.teamService.list().subscribe((res) => this.teams.set(res.data.items));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.dashboardService.getTeam(this.selectedTeamId() ?? undefined).subscribe((res) => {
      this.overview.set(res.data);
      this.loading.set(false);
    });
  }

  onTeamChange(value: string): void {
    this.selectedTeamId.set(value ? Number(value) : null);
    this.load();
  }
}
