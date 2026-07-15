import { Component, Input } from "@angular/core";
import { Icon } from "./icon";

export type StatCardTone = "indigo" | "cyan" | "slate" | "green" | "amber";

const TONE_CLASSES: Record<StatCardTone, string> = {
  indigo: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
  green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
};

@Component({
  selector: "app-stat-card",
  imports: [Icon],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-start justify-between">
      <div>
        <div class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ label }}</div>
        <div class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">{{ value }}</div>
        @if (sublabel) {
          <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ sublabel }}</div>
        }
      </div>
      <div class="w-10 h-10 rounded-lg flex items-center justify-center" [class]="toneClasses">
        <app-icon [name]="icon" [size]="20" />
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
