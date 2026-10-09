import { Component, Input } from "@angular/core";
import { NgFor } from "@angular/common";

@Component({
  selector: "app-skeleton",
  standalone: true,
  imports: [NgFor],
  template: `
    <div
      class="skeleton-row"
      *ngFor="let _ of rowsArray"
      [style.height.px]="height"
      [style.marginBottom.px]="gap"
    ></div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skeleton-row {
        border-radius: var(--radius-sm);
        background: linear-gradient(90deg, var(--surface) 0%, var(--surface-2) 50%, var(--surface) 100%);
        background-size: 200% 100%;
        animation: shimmer 1.4s ease-in-out infinite;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
})
export class SkeletonComponent {
  @Input() rows = 3;
  @Input() height = 44;
  @Input() gap = 8;

  get rowsArray() {
    return Array.from({ length: this.rows });
  }
}
