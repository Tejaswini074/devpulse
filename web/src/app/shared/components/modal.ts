import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { Icon } from "./icon";

@Component({
  selector: "app-modal",
  imports: [Icon],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm
               transition-opacity duration-200 starting:opacity-0"
        (click)="onBackdropClick($event)"
      >
        <div
          class="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800
                 transition-all duration-200 starting:opacity-0 starting:scale-95 max-h-[90vh] flex flex-col"
          [class]="sizeClass"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
            <button
              type="button"
              (click)="close.emit()"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <app-icon name="x" [size]="16" />
            </button>
          </div>
          <div class="px-6 py-5 overflow-y-auto">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `
})
export class Modal {
  @Input() open = false;
  @Input() title = "";
  @Input() size: "sm" | "md" | "lg" = "md";
  @Output() close = new EventEmitter<void>();

  get sizeClass(): string {
    return { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" }[this.size];
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }
}
