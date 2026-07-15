import { Component, Input } from "@angular/core";
import { Icon } from "./icon";

export type StatCardTone = "indigo" | "cyan" | "slate" | "green" | "amber";

const TONE_CLASSES: Record<StatCardTone, string> = {
  indigo: "bg-linear-to-br from-brand-500 to-brand-600 shadow-brand-500/25",
  cyan: "bg-linear-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/25",
  slate: "bg-linear-to-br from-slate-600 to-slate-700 shadow-slate-500/25",
  green: "bg-linear-to-br from-green-500 to-green-600 shadow-green-500/25",
  amber: "bg-linear-to-br from-amber-500 to-amber-600 shadow-amber-500/25"
};

@Component({
  selector: "app-stat-card",
  imports: [Icon],
  template: `
    <div class="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-start justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70 dark:hover:shadow-none dark:hover:border-slate-700">
      <div>
        <div class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ label }}</div>
        <div class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{{ value }}</div>
        @if (sublabel) {
          <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ sublabel }}</div>
        }
      </div>
      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105" [class]="toneClasses">
        <app-icon [name]="icon" [size]="19" />
      </div>
    </div>
  `
})
export class StatCard {
  @Input() label = "";
  @Input() value: string | number = "";
  @Input() sublabel = "";
  @Input() icon = "grid";
  @Input() tone: StatCardTone = "indigo";

  get toneClasses(): string {
    return TONE_CLASSES[this.tone];
  }
}
