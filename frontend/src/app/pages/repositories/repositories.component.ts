import { Component, OnInit, inject } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { ApiService } from "../../core/api.service";
import { ToastService } from "../../shared/toast.service";
import { IconComponent } from "../../shared/ui/icon/icon.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { SkeletonComponent } from "../../shared/ui/skeleton/skeleton.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";

interface AvailableRepo {
  githubRepoId: string;
  fullName: string;
  private: boolean;
  description: string | null;
  connected: boolean;
}

@Component({
  selector: "app-repositories",
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, IconComponent, BadgeComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Repositories</h1>
        <p>Connect a GitHub repository to start receiving webhook events.</p>
      </div>
      <div class="search" *ngIf="!loading && repos.length > 0">
        <app-icon name="search" [size]="14"></app-icon>
        <input type="search" placeholder="Filter repositories..." [(ngModel)]="filterText" />
      </div>
    </div>

    <app-skeleton *ngIf="loading" [rows]="4" [height]="56"></app-skeleton>

    <app-empty-state
      *ngIf="!loading && loadError"
      icon="alert-circle"
      title="Couldn't load repositories"
      [description]="loadError"
    ></app-empty-state>

    <app-empty-state
      *ngIf="!loading && !loadError && repos.length === 0"
      icon="repo"
      title="No repositories found"
      description="We couldn't find any repositories on your GitHub account."
    ></app-empty-state>

    <app-empty-state
      *ngIf="!loading && !loadError && repos.length > 0 && filteredRepos().length === 0"
      icon="search"
      title="No matches"
      description="No repositories match your filter."
    ></app-empty-state>

    <div class="card repo-row" *ngFor="let repo of filteredRepos()">
      <div class="repo-info">
        <div class="repo-name">
          <app-icon name="repo" [size]="14"></app-icon>
          <strong>{{ repo.fullName }}</strong>
          <app-badge [tone]="repo.connected ? 'success' : 'neutral'">
            {{ repo.connected ? "Connected" : "Not connected" }}
          </app-badge>
        </div>
        <p class="muted" *ngIf="repo.description">{{ repo.description }}</p>
      </div>
      <button
        class="btn"
        [class.secondary]="repo.connected"
        [disabled]="repo.connected || connecting === repo.githubRepoId"
        (click)="connect(repo)"
      >
        {{ connecting === repo.githubRepoId ? "Connecting..." : repo.connected ? "Connected" : "Connect" }}
      </button>
    </div>
  `,
  styles: [
    `
      .search {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 6px 10px;
        color: var(--text-muted);
        min-width: 220px;
      }
      .search input {
        border: none;
        background: transparent;
        padding: 0;
      }
      .search input:focus {
        border: none;
      }
      .repo-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
      }
      .repo-info {
        min-width: 0;
      }
      .repo-name {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      .repo-row p {
        font-size: 12px;
        margin-top: 2px;
      }
    `,
  ],
})
export class RepositoriesComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  repos: AvailableRepo[] = [];
  loading = true;
  loadError: string | null = null;
  connecting: string | null = null;
  filterText = "";

  // Plain method, not a signal `computed()` — `repos`/`filterText` are
  // ordinary fields, so this re-filters on every change-detection pass
  // (cheap at this list size) instead of memoizing against nothing.
  filteredRepos(): AvailableRepo[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) return this.repos;
    return this.repos.filter((r) => r.fullName.toLowerCase().includes(q));
  }

  async ngOnInit() {
    try {
      const res = await firstValueFrom(this.api.get<{ repositories: AvailableRepo[] }>("/repos/available"));
      this.repos = res.repositories;
    } catch {
      this.loadError = "Failed to load repositories from GitHub.";
    } finally {
      this.loading = false;
    }
  }

  async connect(repo: AvailableRepo) {
    this.connecting = repo.githubRepoId;
    try {
      await firstValueFrom(
        this.api.post("/repos/connect", { githubRepoId: repo.githubRepoId, fullName: repo.fullName })
      );
      repo.connected = true;
      this.toast.success(`Connected ${repo.fullName}`);
    } catch {
      this.toast.error(`Failed to connect ${repo.fullName}.`);
    } finally {
      this.connecting = null;
    }
  }
}
