import { Component, OnInit, inject } from "@angular/core";
import { DatePipe, JsonPipe, NgFor, NgIf } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { ApiService } from "../../core/api.service";
import { ToastService } from "../../shared/toast.service";
import { IconComponent } from "../../shared/ui/icon/icon.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { SkeletonComponent } from "../../shared/ui/skeleton/skeleton.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { actionStatusTone, eventStatusTone } from "../../shared/status";

interface ActionLog {
  id: string;
  ruleName: string | null;
  type: string;
  status: string;
  detail: unknown;
  createdAt: string;
}

interface EventDetail {
  id: string;
  repositoryFullName: string;
  eventType: string;
  action: string | null;
  status: string;
  receivedAt: string;
  processedAt: string | null;
  job: { status: string; attempts: number; lastError: string | null } | null;
  actionLogs: ActionLog[];
}

@Component({
  selector: "app-event-detail",
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    JsonPipe,
    DatePipe,
    RouterLink,
    IconComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
  ],
  template: `
    <a class="back-link" routerLink="/dashboard/events">
      <app-icon name="chevron-left" [size]="14"></app-icon>
      Back to events
    </a>

    <app-skeleton *ngIf="loading" [rows]="3" [height]="48"></app-skeleton>

    <app-empty-state
      *ngIf="!loading && notFound"
      icon="alert-circle"
      title="Event not found"
      description="This event doesn't exist or you don't have access to it."
    ></app-empty-state>

    <ng-container *ngIf="!loading && event as ev">
      <div class="page-header">
        <div>
          <h1>{{ ev.repositoryFullName }}</h1>
          <p class="mono">{{ ev.eventType }}<span *ngIf="ev.action">.{{ ev.action }}</span></p>
        </div>
        <app-badge [tone]="statusTone(ev.status)">{{ ev.status }}</app-badge>
      </div>

      <div class="card meta-card">
        <div>
          <span class="muted">Received</span>
          <strong>{{ ev.receivedAt | date: "medium" }}</strong>
        </div>
        <div *ngIf="ev.processedAt">
          <span class="muted">Processed</span>
          <strong>{{ ev.processedAt | date: "medium" }}</strong>
        </div>
        <div *ngIf="ev.job">
          <span class="muted">Job</span>
          <strong>{{ ev.job.status }} &middot; {{ ev.job.attempts }} attempt(s)</strong>
        </div>
      </div>
      <div class="card" *ngIf="ev.job?.lastError">
        <span class="muted">Last error</span>
        <p class="mono error-text">{{ ev.job!.lastError }}</p>
      </div>

      <h3 class="section-title">Actions</h3>

      <app-empty-state
        *ngIf="ev.actionLogs.length === 0"
        icon="zap"
        title="No actions were taken"
        description="No rule matched this event, so nothing was executed."
      ></app-empty-state>

      <div class="card timeline-item" *ngFor="let log of ev.actionLogs">
        <div class="timeline-head">
          <strong class="mono">{{ log.type }}</strong>
          <app-badge [tone]="actionTone(log.status)">{{ log.status }}</app-badge>
          <span class="muted" *ngIf="log.ruleName">via "{{ log.ruleName }}"</span>
          <span class="muted timeline-time">{{ log.createdAt | date: "short" }}</span>
        </div>
        <pre class="mono detail-block" *ngIf="log.detail">{{ log.detail | json }}</pre>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--text-muted);
        font-size: 13px;
        margin-bottom: var(--space-4);
      }
      .back-link:hover {
        color: var(--text);
      }
      .page-header p {
        margin-top: 2px;
      }
      .meta-card {
        display: flex;
        gap: var(--space-6);
        flex-wrap: wrap;
      }
      .meta-card > div {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .meta-card .muted {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .error-text {
        color: var(--danger);
        white-space: pre-wrap;
      }
      .section-title {
        font-size: 13px;
        font-weight: 600;
        margin: var(--space-5) 0 var(--space-3);
      }
      .timeline-item {
        border-left: 2px solid var(--border-strong);
      }
      .timeline-head {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        flex-wrap: wrap;
      }
      .timeline-time {
        margin-left: auto;
        font-size: 12px;
      }
      .detail-block {
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: var(--space-3);
        margin-top: var(--space-3);
        font-size: 12px;
        white-space: pre-wrap;
        word-break: break-word;
      }
    `,
  ],
})
export class EventDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  event: EventDetail | null = null;
  loading = true;
  notFound = false;
  statusTone = eventStatusTone;
  actionTone = actionStatusTone;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    try {
      const res = await firstValueFrom(this.api.get<{ event: EventDetail }>(`/events/${id}`));
      this.event = res.event;
    } catch {
      this.notFound = true;
      this.toast.error("Failed to load this event.");
    } finally {
      this.loading = false;
    }
  }
}
