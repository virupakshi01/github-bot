import { Component, OnInit, inject } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { ApiService } from "../../core/api.service";
import { ToastService } from "../../shared/toast.service";
import { IconComponent } from "../../shared/ui/icon/icon.component";
import { BadgeComponent } from "../../shared/ui/badge/badge.component";
import { SkeletonComponent } from "../../shared/ui/skeleton/skeleton.component";
import { EmptyStateComponent } from "../../shared/ui/empty-state/empty-state.component";
import { CardComponent } from "../../shared/ui/card/card.component";

interface ConnectedRepo {
  id: string;
  fullName: string;
}

interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    eventType?: string;
    action?: string;
    titleKeywords?: string[];
    author?: string;
    labels?: string[];
  };
  actions: {
    addLabel?: string;
    postComment?: string;
    slackNotify?: boolean;
  };
}

@Component({
  selector: "app-rules",
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    RouterLink,
    IconComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    CardComponent,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Rules</h1>
        <p>Match incoming GitHub events and automate labels, comments and Slack alerts.</p>
      </div>
    </div>

    <app-skeleton *ngIf="loading" [rows]="2" [height]="40"></app-skeleton>

    <app-empty-state
      *ngIf="!loading && repos.length === 0"
      icon="repo"
      title="No connected repositories"
      description="Connect a repository first, then come back here to create automation rules."
    >
      <a class="btn" routerLink="/dashboard/repositories">Go to Repositories</a>
    </app-empty-state>

    <ng-container *ngIf="!loading && repos.length > 0">
      <div class="card">
        <div class="field" style="margin-bottom:0;">
          <label>Repository</label>
          <select [(ngModel)]="selectedRepoId" (ngModelChange)="loadRules()">
            <option *ngFor="let r of repos" [value]="r.id">{{ r.fullName }}</option>
          </select>
        </div>
      </div>

      <app-card title="New rule" subtitle="Leave a field blank to match any value." *ngIf="selectedRepoId">
        <div class="form-section-title">Conditions</div>
        <div class="form-grid">
          <div class="field">
            <label>Event type</label>
            <input placeholder="issues / pull_request / push" [(ngModel)]="draft.eventType" />
          </div>
          <div class="field">
            <label>Action</label>
            <input placeholder="opened, closed, ..." [(ngModel)]="draft.action" />
          </div>
          <div class="field">
            <label>Title keywords</label>
            <input placeholder="comma separated" [(ngModel)]="draft.titleKeywords" />
          </div>
          <div class="field">
            <label>Author</label>
            <input placeholder="github username" [(ngModel)]="draft.author" />
          </div>
          <div class="field">
            <label>Labels</label>
            <input placeholder="comma separated" [(ngModel)]="draft.labels" />
          </div>
        </div>

        <div class="form-section-title">Actions</div>
        <div class="form-grid">
          <div class="field">
            <label>Rule name</label>
            <input placeholder="Untitled rule" [(ngModel)]="draft.name" />
          </div>
          <div class="field">
            <label>Add label</label>
            <input placeholder="e.g. bug" [(ngModel)]="draft.addLabel" />
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label>Post comment</label>
            <input placeholder="Comment body" [(ngModel)]="draft.postComment" />
          </div>
        </div>
        <label class="checkbox-row">
          <input type="checkbox" [(ngModel)]="draft.slackNotify" /> Notify Slack
        </label>
        <p class="muted" *ngIf="!hasAction()">Choose at least one action before creating this rule.</p>

        <button class="btn" style="margin-top:var(--space-2);" [disabled]="creating || !hasAction()" (click)="createRule()">
          <app-icon name="plus" [size]="14"></app-icon>
          {{ creating ? "Creating..." : "Create rule" }}
        </button>
      </app-card>

      <app-skeleton *ngIf="rulesLoading" [rows]="3" [height]="64"></app-skeleton>

      <app-empty-state
        *ngIf="!rulesLoading && rules.length === 0"
        icon="zap"
        title="No rules yet"
        description="Create your first rule above to start automating this repository."
      ></app-empty-state>

      <div class="card rule-row" *ngFor="let rule of rules">
        <div class="rule-info">
          <div class="rule-title">
            <strong>{{ rule.name }}</strong>
            <app-badge [tone]="rule.enabled ? 'success' : 'neutral'">
              {{ rule.enabled ? "Active" : "Disabled" }}
            </app-badge>
          </div>
          <p class="muted mono">{{ summarize(rule) }}</p>
        </div>
        <div class="rule-actions">
          <button class="btn secondary sm" (click)="toggle(rule)">
            {{ rule.enabled ? "Disable" : "Enable" }}
          </button>
          <button class="btn danger sm" (click)="remove(rule)">Delete</button>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .rule-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--space-4);
      }
      .rule-info {
        min-width: 0;
      }
      .rule-title {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      .rule-row p {
        font-size: 12px;
        margin-top: 4px;
      }
      .rule-actions {
        display: flex;
        gap: var(--space-2);
        flex-shrink: 0;
      }
    `,
  ],
})
export class RulesComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  repos: ConnectedRepo[] = [];
  rules: Rule[] = [];
  selectedRepoId = "";
  loading = true;
  rulesLoading = false;
  creating = false;
  private rulesRequestId = 0;

  draft = {
    name: "",
    eventType: "",
    action: "",
    titleKeywords: "",
    author: "",
    labels: "",
    addLabel: "",
    postComment: "",
    slackNotify: false,
  };

  async ngOnInit() {
    try {
      const res = await firstValueFrom(this.api.get<{ repositories: ConnectedRepo[] }>("/repos"));
      this.repos = res.repositories;
      if (this.repos.length > 0) {
        this.selectedRepoId = this.repos[0].id;
        await this.loadRules();
      }
    } catch {
      this.toast.error("Failed to load connected repositories.");
    } finally {
      this.loading = false;
    }
  }

  async loadRules() {
    if (!this.selectedRepoId) return;
    const requestId = ++this.rulesRequestId;
    const repositoryId = this.selectedRepoId;
    this.rulesLoading = true;
    this.rules = [];
    try {
      const res = await firstValueFrom(
        this.api.get<{ rules: Rule[] }>("/rules", { repositoryId })
      );
      if (requestId !== this.rulesRequestId) return;
      this.rules = res.rules;
    } catch {
      if (requestId !== this.rulesRequestId) return;
      this.toast.error("Failed to load rules for this repository.");
    } finally {
      if (requestId === this.rulesRequestId) this.rulesLoading = false;
    }
  }

  hasAction(): boolean {
    return Boolean(this.draft.addLabel.trim() || this.draft.postComment.trim() || this.draft.slackNotify);
  }

  async createRule() {
    if (!this.hasAction()) {
      this.toast.error("Choose at least one action before creating this rule.");
      return;
    }
    const csv = (v: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : undefined);
    this.creating = true;
    try {
      await firstValueFrom(
        this.api.post("/rules", {
          repositoryId: this.selectedRepoId,
          name: this.draft.name || "Untitled rule",
          enabled: true,
          conditions: {
            eventType: this.draft.eventType || undefined,
            action: this.draft.action || undefined,
            titleKeywords: csv(this.draft.titleKeywords),
            author: this.draft.author || undefined,
            labels: csv(this.draft.labels),
          },
          actions: {
            addLabel: this.draft.addLabel || undefined,
            postComment: this.draft.postComment || undefined,
            slackNotify: this.draft.slackNotify || undefined,
          },
        })
      );
      this.draft = {
        name: "",
        eventType: "",
        action: "",
        titleKeywords: "",
        author: "",
        labels: "",
        addLabel: "",
        postComment: "",
        slackNotify: false,
      };
      this.toast.success("Rule created.");
      await this.loadRules();
    } catch {
      this.toast.error("Failed to create rule.");
    } finally {
      this.creating = false;
    }
  }

  async toggle(rule: Rule) {
    try {
      await firstValueFrom(this.api.patch(`/rules/${rule.id}`, { enabled: !rule.enabled }));
      await this.loadRules();
    } catch {
      this.toast.error("Failed to update rule.");
    }
  }

  async remove(rule: Rule) {
    try {
      await firstValueFrom(this.api.delete(`/rules/${rule.id}`));
      this.toast.success(`Deleted "${rule.name}".`);
      await this.loadRules();
    } catch {
      this.toast.error("Failed to delete rule.");
    }
  }

  summarize(rule: Rule): string {
    const c = rule.conditions;
    const parts: string[] = [];
    if (c.eventType) parts.push(c.eventType + (c.action ? `.${c.action}` : ""));
    if (c.titleKeywords?.length) parts.push(`title~[${c.titleKeywords.join(", ")}]`);
    if (c.author) parts.push(`author=${c.author}`);
    if (c.labels?.length) parts.push(`labels=[${c.labels.join(", ")}]`);
    const when = parts.length ? parts.join(" · ") : "any event";

    const a = rule.actions;
    const actions: string[] = [];
    if (a.addLabel) actions.push(`add label "${a.addLabel}"`);
    if (a.postComment) actions.push("post comment");
    if (a.slackNotify) actions.push("notify Slack");
    const then = actions.length ? actions.join(", ") : "no action";

    return `${when} -> ${then}`;
  }
}
