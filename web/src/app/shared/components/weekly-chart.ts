import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from "@angular/core";
import { Chart, registerables } from "chart.js";
import { WeeklyReportDay } from "../../core/models/dashboard.model";

Chart.register(...registerables);

@Component({
  selector: "app-weekly-chart",
  template: `<div class="relative h-64"><canvas #canvas></canvas></div>`
})
export class WeeklyChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() days: WeeklyReportDay[] = [];
  @ViewChild("canvas") canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

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
        scales: {
          y: { beginAtZero: true, position: "left", title: { display: true, text: "Hours" } },
          y1: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "Commits" } }
        }
      }
    });
  }
}
