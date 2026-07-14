import { Component, Input } from "@angular/core";
import { Icon } from "./icon";

@Component({
  selector: "app-stat-card",
  imports: [Icon],
  template: `
    <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between">
      <div>
        <div class="text-sm text-slate-500 font-medium">{{ label }}</div>
        <div class="text-2xl font-semibold text-slate-900 mt-1">{{ value }}</div>
        @if (sublabel) {
          <div class="text-xs text-slate-400 mt-1">{{ sublabel }}</div>
        }
      </div>
      <div class="w-10 h-10 rounded-lg flex items-center justify-center" [style.background-color]="bg" [style.color]="color">
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
  @Input() color = "#4f46e5";
  @Input() bg = "#eef2ff";
}
