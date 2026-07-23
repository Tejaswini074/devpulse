import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Icon } from "./icon";

@Component({
  selector: "app-pagination",
  imports: [Icon],
  template: `
    @if (totalPages > 1) {
      <div class="flex items-center justify-between gap-3 px-1 py-2">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Page {{ page }} of {{ totalPages }}{{ total ? " (" + total + " total)" : "" }}
        </p>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            [disabled]="page <= 1"
            (click)="pageChange.emit(page - 1)"
            class="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <app-icon name="chevron-down" [size]="12" class="rotate-90" />
            Prev
          </button>
          <button
            type="button"
            [disabled]="page >= totalPages"
            (click)="pageChange.emit(page + 1)"
            class="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <app-icon name="chevron-down" [size]="12" class="-rotate-90" />
          </button>
        </div>
      </div>
    }
  `
})
export class Pagination {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();
}
