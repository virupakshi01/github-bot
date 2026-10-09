import { Component, Input } from "@angular/core";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-card",
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="card" style="margin-bottom:0;">
      <div class="card-head" *ngIf="title">
        <h3>{{ title }}</h3>
        <p *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-bottom: var(--space-3);
      }
      .card-head {
        margin-bottom: var(--space-3);
      }
      .card-head h3 {
        font-size: 14px;
        font-weight: 600;
      }
      .card-head p {
        color: var(--text-muted);
        font-size: 12px;
        margin-top: 2px;
      }
    `,
  ],
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
}
