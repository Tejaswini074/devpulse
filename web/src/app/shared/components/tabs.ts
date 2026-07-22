import { Component, EventEmitter, Input, Output } from "@angular/core";

export interface TabItem {
  id: string;
  label: string;
  badge?: number;
}

@Component({
  selector: "app-tabs",
  template: `
    <div class="flex gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
      @for (tab of tabs; track tab.id) {
        <button
          type="button"
          (click)="activeChange.emit(tab.id)"
          class="relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
          [class]="tab.id === active
            ? 'text-brand-600 dark:text-brand-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
        >
          {{ tab.label }}
          @if (tab.badge) {
            <span class="ml-1.5 inline-flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold px-1.5 py-0.5">
              {{ tab.badge }}
            </span>
          }
          @if (tab.id === active) {
            <span class="absolute left-0 right-0 -bottom-px h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full"></span>
          }
        </button>
      }
    </div>
  `
})
export class Tabs {
  @Input() tabs: TabItem[] = [];
  @Input() active = "";
  @Output() activeChange = new EventEmitter<string>();
}
