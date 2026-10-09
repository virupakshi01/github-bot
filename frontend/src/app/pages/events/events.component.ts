import { Component, OnInit, inject } from "@angular/core";
import { DatePipe, NgFor, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { ApiService } from "../../core/api.service";
import { ToastService } from "../../shared/toast.service";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { SkeletonComponent } from "../../shared/ui/skeleton/skeleton.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { eventStatusTone } from "../../shared/status";

interface EventRow {
  id: string;
  repositoryFullName: string;
  eventType: string;
  action: string | null;
  status: string;
  receivedAt: string;
}

const STAT_TILES: { key: keyof EventStats; label: string }[] = [
  { key: "RECEIVED", label: "Received" },
  { key: "PROCESSING", label: "Processing" },
  { key: "COMPLETED", label: "Completed" },
  { key: "FAILED", label: "Failed" },
];

type EventStats = Record<"RECEIVED" | "PROCESSING" | "COMPLETED" | "FAILED", number>;

@Component({
  selector: "app-events",
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink, BadgeComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Events</h1>
        <p>Webhook deliveries received from your connected repositories.</p>
      </div>
    </div>

    <div class="stat-grid" *ngIf="stats">
      <div class="stat-tile" *ngFor="let tile of tiles">
        <div class="value">{{ stats[tile.key] }}</div>
        <div class="label">{{ tile.label }}</div>
      </div>
    </div>

    <app-skeleton *ngIf="loading" [rows]="5" [height]="48"></app-skeleton>

    <app-empty-state
      *ngIf="!loading && events.length === 0"
      icon="activity"
      title="No events yet"
      description="Once GitHub sends a webhook for a connected repository, it will show up here."
    ></app-empty-state>

    <div class="table-scroll" *ngIf="!loading && events.length > 0">
      <table>
        <thead>
          <tr>
            <th>Repository</th>
            <th>Type</th>
            <th>Action</th>
            <th>Status</th>
            <th>Received</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of events">
            <td>{{ e.repositoryFullName }}</td>
            <td class="mono">{{ e.eventType }}</td>
            <td class="mono">{{ e.action }}</td>
            <td><app-badge [tone]="statusTone(e.status)">{{ e.status }}</app-badge></td>
            <td class="muted">{{ e.receivedAt | date: "short" }}</td>
            <td><a [routerLink]="['/dashboard/events', e.id]">View &rarr;</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class EventsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  events: EventRow[] = [];
  stats: EventStats | null = null;
  loading = true;
  tiles = STAT_TILES;
  statusTone = eventStatusTone;

  async ngOnInit() {
    try {
      const [eventsRes, statsRes] = await Promise.all([
        firstValueFrom(this.api.get<{ events: EventRow[] }>("/events")),
        firstValueFrom(this.api.get<{ stats: EventStats }>("/events/stats")),
      ]);
      this.events = eventsRes.events;
      this.stats = statsRes.stats;
    } catch {
      this.toast.error("Failed to load events.");
    } finally {
      this.loading = false;
    }
  }
}
