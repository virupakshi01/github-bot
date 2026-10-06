import { Octokit } from "@octokit/rest";
import crypto from "crypto";
import { env } from "../env";

export function githubClientFor(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken });
}

export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function listUserRepositories(accessToken: string) {
  const octokit = githubClientFor(accessToken);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    per_page: 100,
    sort: "updated",
  });
  return data;
}

export async function registerRepositoryWebhook(params: {
  accessToken: string;
  owner: string;
  repo: string;
  secret: string;
}): Promise<string> {
  const octokit = githubClientFor(params.accessToken);
  const { data } = await octokit.repos.createWebhook({
    owner: params.owner,
    repo: params.repo,
    config: {
      url: `${env.BACKEND_URL}/api/webhooks/github`,
      content_type: "json",
      secret: params.secret,
    },
    events: ["issues", "pull_request", "push"],
  });
  return String(data.id);
}

export async function addLabel(params: {
  accessToken: string;
  owner: string;
  repo: string;
  issueNumber: number;
  label: string;
}) {
  const octokit = githubClientFor(params.accessToken);
  return octokit.issues.addLabels({
    owner: params.owner,
    repo: params.repo,
    issue_number: params.issueNumber,
    labels: [params.label],
  });
}

export async function postComment(params: {
  accessToken: string;
  owner: string;
  repo: string;
  issueNumber: number;
  body: string;
}) {
  const octokit = githubClientFor(params.accessToken);
  return octokit.issues.createComment({
    owner: params.owner,
    repo: params.repo,
    issue_number: params.issueNumber,
    body: params.body,
  });
}
