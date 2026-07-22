import { Component, inject } from "@angular/core";
import { ToastService } from "../../core/services/toast.service";
import { Icon } from "./icon";

const KIND_CLASSES: Record<string, string> = {
  success: "bg-white dark:bg-slate-900 border-green-200 dark:border-green-500/30 text-slate-900 dark:text-slate-100",
  error: "bg-white dark:bg-slate-900 border-red-200 dark:border-red-500/30 text-slate-900 dark:text-slate-100",
  info: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
};

const ICON_CLASSES: Record<string, string> = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-brand-500"
};

const ICON_NAMES: Record<string, string> = {
  success: "check-square",
  error: "x",
  info: "bell"
};

@Component({
  selector: "app-toast-container",
  imports: [Icon],
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 transition-all duration-200 starting:opacity-0 starting:translate-y-2"
          [class]="kindClass(toast.kind)"
        >
          <span [class]="iconClass(toast.kind)" class="mt-0.5 shrink-0">
            <app-icon [name]="iconName(toast.kind)" [size]="16" />
          </span>
          <p class="text-sm leading-snug flex-1">{{ toast.message }}</p>
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
          >
            <app-icon name="x" [size]="14" />
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainer {
  protected toastService = inject(ToastService);

  kindClass(kind: string): string {
    return KIND_CLASSES[kind];
  }

  iconClass(kind: string): string {
    return ICON_CLASSES[kind];
  }

  iconName(kind: string): string {
    return ICON_NAMES[kind];
  }
}
