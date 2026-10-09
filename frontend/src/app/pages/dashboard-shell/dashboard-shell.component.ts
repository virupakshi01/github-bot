import { Component, inject, signal } from "@angular/core";
import { NgIf } from "@angular/common";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import { IconComponent } from "../../shared/ui/icon/icon.component";

@Component({
  selector: "app-dashboard-shell",
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  template: `
    <div class="shell">
      <div class="backdrop" *ngIf="sidebarOpen()" (click)="sidebarOpen.set(false)"></div>

      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="brand">
          <span class="brand-mark"><app-icon name="zap" [size]="16"></app-icon></span>
          <span class="brand-name">Automation Bot</span>
        </div>

        <nav class="nav">
          <a
            routerLink="/dashboard/repositories"
            routerLinkActive="active"
            (click)="sidebarOpen.set(false)"
          >
            <app-icon name="repo" [size]="16"></app-icon>
            Repositories
          </a>
          <a routerLink="/dashboard/rules" routerLinkActive="active" (click)="sidebarOpen.set(false)">
            <app-icon name="zap" [size]="16"></app-icon>
            Rules
          </a>
          <a routerLink="/dashboard/events" routerLinkActive="active" (click)="sidebarOpen.set(false)">
            <app-icon name="activity" [size]="16"></app-icon>
            Events
          </a>
        </nav>

        <div class="user-block" *ngIf="auth.user() as u">
          <span class="avatar">{{ u.username.charAt(0).toUpperCase() }}</span>
          <span class="username">{{ u.username }}</span>
          <button class="icon-btn" (click)="logout()" aria-label="Log out" title="Log out">
            <app-icon name="log-out" [size]="16"></app-icon>
          </button>
        </div>
      </aside>

      <div class="main">
        <div class="topbar">
          <button class="icon-btn" (click)="sidebarOpen.set(true)" aria-label="Open menu">
            <app-icon name="menu" [size]="18"></app-icon>
          </button>
          <span class="brand-name">Automation Bot</span>
        </div>
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: grid;
        grid-template-columns: 240px 1fr;
        min-height: 100vh;
      }

      .sidebar {
        background: var(--surface);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        padding: var(--space-4) var(--space-3);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-2) var(--space-5);
        font-weight: 600;
        font-size: 14px;
      }
      .brand-mark {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: var(--radius-sm);
        background: var(--accent);
        color: #fff;
      }

      .nav {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }
      .nav a {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 500;
        padding: 8px 10px;
        border-radius: var(--radius-sm);
      }
      .nav a:hover {
        background: var(--surface-2);
        color: var(--text);
      }
      .nav a.active {
        background: var(--surface-2);
        color: var(--text);
      }

      .user-block {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2);
        border-top: 1px solid var(--border);
        margin-top: var(--space-3);
        padding-top: var(--space-3);
      }
      .avatar {
        width: 26px;
        height: 26px;
        border-radius: 999px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
      }
      .username {
        flex: 1;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--text-muted);
        cursor: pointer;
      }
      .icon-btn:hover {
        background: var(--surface-2);
        color: var(--text);
      }

      .main {
        min-width: 0;
      }

      .topbar {
        display: none;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        background: var(--bg);
        z-index: 10;
      }
      .topbar .brand-name {
        font-weight: 600;
        font-size: 14px;
      }

      .backdrop {
        display: none;
      }

      @media (max-width: 768px) {
        .shell {
          grid-template-columns: 1fr;
        }
        .sidebar {
          position: fixed;
          inset: 0 25% 0 0;
          z-index: 30;
          transform: translateX(-100%);
          transition: transform 0.18s ease;
        }
        .sidebar.open {
          transform: translateX(0);
        }
        .topbar {
          display: flex;
        }
        .backdrop {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 20;
        }
      }
    `,
  ],
})
export class DashboardShellComponent {
  auth = inject(AuthService);
  sidebarOpen = signal(false);

  async logout() {
    await this.auth.logout();
    location.href = "/login";
  }
}
