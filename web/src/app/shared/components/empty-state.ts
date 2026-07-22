import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Icon } from "./icon";

@Component({
  selector: "app-empty-state",
  imports: [Icon],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-12 px-4">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
        <app-icon [name]="icon" [size]="20" />
      </div>
      <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ title }}</p>
      @if (subtitle) {
        <p class="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{{ subtitle }}</p>
      }
      @if (actionLabel) {
        <button
          type="button"
          (click)="action.emit()"
          class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3.5 py-2 transition-colors"
        >
          {{ actionLabel }}
        </button>
      }
    </div>
  `
})
export class EmptyState {
  @Input() icon = "inbox";
  @Input() title = "Nothing here yet";
  @Input() subtitle = "";
  @Input() actionLabel = "";
  @Output() action = new EventEmitter<void>();
}
