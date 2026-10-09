import { Component, Input } from "@angular/core";
import { NgSwitch, NgSwitchCase } from "@angular/common";

export type IconName =
  | "repo"
  | "zap"
  | "activity"
  | "menu"
  | "chevron-left"
  | "log-out"
  | "check-circle"
  | "x-circle"
  | "clock"
  | "alert-circle"
  | "search"
  | "github"
  | "plus";

@Component({
  selector: "app-icon",
  standalone: true,
  imports: [NgSwitch, NgSwitchCase],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      [attr.fill]="name === 'github' ? 'currentColor' : 'none'"
      [attr.stroke]="name === 'github' ? 'none' : 'currentColor'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="app-icon"
    >
      <ng-container [ngSwitch]="name">
        <g *ngSwitchCase="'repo'">
          <line x1="6" y1="3" x2="6" y2="15"></line>
          <circle cx="18" cy="6" r="3"></circle>
          <circle cx="6" cy="18" r="3"></circle>
          <path d="M18 9a9 9 0 0 1-9 9"></path>
        </g>
        <polygon *ngSwitchCase="'zap'" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        <polyline *ngSwitchCase="'activity'" points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        <g *ngSwitchCase="'menu'">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </g>
        <polyline *ngSwitchCase="'chevron-left'" points="15 18 9 12 15 6"></polyline>
        <g *ngSwitchCase="'log-out'">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </g>
        <g *ngSwitchCase="'check-circle'">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 12l2.5 2.5L16 9"></path>
        </g>
        <g *ngSwitchCase="'x-circle'">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </g>
        <g *ngSwitchCase="'clock'">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </g>
        <g *ngSwitchCase="'alert-circle'">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </g>
        <g *ngSwitchCase="'search'">
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </g>
        <g *ngSwitchCase="'plus'">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </g>
        <path
          *ngSwitchCase="'github'"
          d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z"
        ></path>
      </ng-container>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
      .app-icon {
        flex-shrink: 0;
      }
    `,
  ],
})
export class IconComponent {
  @Input() name: IconName = "repo";
  @Input() size = 16;
}
