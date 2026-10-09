import { Component, Input } from "@angular/core";
import { IconComponent, IconName } from "../icon/icon.component";

@Component({
  selector: "app-empty-state",
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="empty">
      <div class="empty-icon"><app-icon [name]="icon" [size]="22"></app-icon></div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .empty {
        text-align: center;
        padding: var(--space-6) var(--space-4);
        color: var(--text-muted);
      }
      .empty-icon {
        width: 44px;
        height: 44px;
        margin: 0 auto var(--space-3);
        border-radius: 999px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
      }
      .empty h3 {
        color: var(--text);
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      .empty p {
        font-size: 13px;
        max-width: 360px;
        margin: 0 auto;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon: IconName = "repo";
  @Input() title = "Nothing here yet";
  @Input() description = "";
}
