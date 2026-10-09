import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../core/api.service";
import { ToastService } from "../../shared/toast.service";
import { IconComponent } from "../../shared/ui/icon/icon.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="page">
      <div class="panel">
        <div class="mark"><app-icon name="zap" [size]="20"></app-icon></div>
        <h1>GitHub Automation Bot</h1>
        <p>Connect your GitHub account to manage webhooks, rules and automations.</p>
        <a class="btn block" [href]="loginUrl">
          <app-icon name="github" [size]="16"></app-icon>
          Sign in with GitHub
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-4);
        background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12), transparent 60%), var(--bg);
      }
      .panel {
        width: 100%;
        max-width: 360px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-6) var(--space-5);
        text-align: center;
        box-shadow: var(--shadow-md);
      }
      .mark {
        width: 44px;
        height: 44px;
        margin: 0 auto var(--space-4);
        border-radius: var(--radius-md);
        background: var(--accent);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      h1 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: var(--space-2);
      }
      p {
        color: var(--text-muted);
        font-size: 13px;
        margin-bottom: var(--space-5);
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  loginUrl = this.api.loginUrl();

  ngOnInit() {
    const error = this.route.snapshot.queryParamMap.get("error");
    if (error === "oauth_failed") {
      this.toast.error("GitHub sign-in failed. Please try again.");
    }
  }
}
