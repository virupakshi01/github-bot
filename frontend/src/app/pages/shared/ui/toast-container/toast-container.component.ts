import { Component, inject } from "@angular/core";
import { NgFor } from "@angular/common";
import { ToastService } from "../../toast.service";
import { IconComponent } from "../icon/icon.component";

@Component({
  selector: "app-toast-container",
  standalone: true,
  imports: [NgFor, IconComponent],
  template: `
    <div class="toast-stack">
      <div class="toast" *ngFor="let t of toasts.toasts()" [class]="'kind-' + t.kind">
        <app-icon
          [name]="t.kind === 'success' ? 'check-circle' : t.kind === 'error' ? 'x-circle' : 'alert-circle'"
          [size]="16"
        ></app-icon>
        <span>{{ t.message }}</span>
        <button class="dismiss" (click)="toasts.dismiss(t.id)" aria-label="Dismiss">&times;</button>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        bottom: var(--space-5);
        right: var(--space-5);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        z-index: 1000;
        max-width: 360px;
      }
      .toast {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        background: var(--surface-2);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-md);
        padding: 10px 12px;
        font-size: 13px;
        box-shadow: var(--shadow-md);
        animation: toast-in 0.15s ease;
      }
      .toast span {
        flex: 1;
      }
      .toast.kind-success {
        color: var(--success);
      }
      .toast.kind-error {
        color: var(--danger);
      }
      .toast.kind-info {
        color: var(--info);
      }
      .dismiss {
        background: none;
        border: none;
        color: inherit;
        opacity: 0.6;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
      }
      .dismiss:hover {
        opacity: 1;
      }
      @keyframes toast-in {
        from {
          transform: translateY(8px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @media (max-width: 480px) {
        .toast-stack {
          left: var(--space-3);
          right: var(--space-3);
          max-width: none;
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  toasts = inject(ToastService);
}
