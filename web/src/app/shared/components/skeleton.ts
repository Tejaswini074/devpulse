import { Component, Input } from "@angular/core";

@Component({
  selector: "app-skeleton",
  template: `
    <div class="animate-pulse space-y-3" [style.width]="width">
      @for (row of rowsArray; track row) {
        <div class="h-4 rounded-md bg-slate-200 dark:bg-slate-800" [style.width]="row === rowsArray.length - 1 ? '70%' : '100%'"></div>
      }
    </div>
  `
})
export class Skeleton {
  @Input() rows = 3;
  @Input() width = "100%";

  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
