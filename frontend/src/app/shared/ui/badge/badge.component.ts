import { Component, Input } from "@angular/core";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

@Component({
  selector: "app-badge",
  standalone: true,
  template: `<span class="badge" [class]="'tone-' + tone"><ng-content></ng-content></span>`,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .tone-success {
        background: var(--success-bg);
        color: var(--success);
      }
      .tone-warning {
        background: var(--warning-bg);
        color: var(--warning);
      }
      .tone-danger {
        background: var(--danger-bg);
        color: var(--danger);
      }
      .tone-info {
        background: var(--info-bg);
        color: var(--info);
      }
      .tone-neutral {
        background: var(--neutral-bg);
        color: var(--neutral);
      }
    `,
  ],
})
export class BadgeComponent {
  @Input() tone: BadgeTone = "neutral";
}
