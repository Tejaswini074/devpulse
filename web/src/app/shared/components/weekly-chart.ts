import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, effect, inject } from "@angular/core";
import { Chart, registerables } from "chart.js";
import { WeeklyReportDay } from "../../core/models/dashboard.model";
import { ThemeService } from "../../core/services/theme.service";

Chart.register(...registerables);

@Component({
  selector: "app-weekly-chart",
  template: `<div class="relative h-64"><canvas #canvas></canvas></div>`
})
export class WeeklyChart implements AfterViewInit, OnChanges, OnDestroy {
  private themeService = inject(ThemeService);

  @Input() days: WeeklyReportDay[] = [];
  @ViewChild("canvas") canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      this.themeService.theme();
      if (this.canvasRef) {
        this.render();
      }
    });
  }

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["days"] && this.canvasRef) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    this.chart?.destroy();

    const isDark = this.themeService.theme() === "dark";
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(100, 116, 139, 0.1)";

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: "bar",
      data: {
        labels: this.days.map((d) => d.day),
        datasets: [
          {
            label: "Hours",
            data: this.days.map((d) => d.hours),
            backgroundColor: "#6366f1",
            borderRadius: 4,
            yAxisID: "y"
          },
          {
            label: "Commits",
            data: this.days.map((d) => d.commits),
            type: "line",
            borderColor: "#f59e0b",
            backgroundColor: "#f59e0b",
            tension: 0.3,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: textColor } }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { beginAtZero: true, position: "left", title: { display: true, text: "Hours", color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
          y1: { beginAtZero: true, position: "right", title: { display: true, text: "Commits", color: textColor }, ticks: { color: textColor }, grid: { drawOnChartArea: false } }
        }
      }
    });
  }
}
