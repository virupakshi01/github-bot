import { Request, Response } from "express";
import { z } from "zod";
import { Repository } from "../models/Repository";
import { Rule } from "../models/Rule";

const conditionsSchema = z.object({
  eventType: z.string().trim().min(1).optional(),
  action: z.string().trim().min(1).optional(),
  titleKeywords: z.array(z.string().trim().min(1)).optional(),
  author: z.string().trim().min(1).optional(),
  labels: z.array(z.string().trim().min(1)).optional(),
}).refine(
  (conditions) =>
    Boolean(
      conditions.eventType ||
        conditions.action ||
        conditions.titleKeywords?.length ||
        conditions.author ||
        conditions.labels?.length
    ),
  { message: "At least one condition is required" }
);

const actionsSchema = z.object({
  addLabel: z.string().trim().min(1).optional(),
  postComment: z.string().trim().min(1).optional(),
  slackNotify: z.boolean().optional(),
}).refine(
  (actions) => Boolean(actions.addLabel || actions.postComment || actions.slackNotify),
  { message: "At least one action is required" }
);

const ruleSchema = z.object({
  repositoryId: z.string().min(1),
  name: z.string().trim().min(1),
  enabled: z.boolean().default(true),
  conditions: conditionsSchema,
  actions: actionsSchema,
});

async function assertRepoOwnership(repositoryId: string, userId: string) {
  const repo = await Repository.findOne({ _id: repositoryId, ownerId: userId });
  return repo !== null;
}

export async function listRules(req: Request, res: Response): Promise<void> {
  const { repositoryId } = req.query as { repositoryId?: string };
  if (!repositoryId || !(await assertRepoOwnership(repositoryId, req.user!.id))) {
    res.status(404).json({ error: "Repository not found" });
    return;
  }
  const rules = await Rule.find({ repositoryId }).sort({ createdAt: -1 });
  res.json({
    rules: rules.map((rule) => ({
      id: String(rule._id),
      repositoryId: String(rule.repositoryId),
      name: rule.name,
      enabled: rule.enabled,
      conditions: rule.conditions,
      actions: rule.actions,
      createdAt: rule.createdAt,
    })),
  });
}

export async function createRule(req: Request, res: Response): Promise<void> {
  const parsed = ruleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!(await assertRepoOwnership(parsed.data.repositoryId, req.user!.id))) {
    res.status(404).json({ error: "Repository not found" });
    return;
  }
  const rule = await Rule.create(parsed.data);
  res.status(201).json({ rule });
}

const updateSchema = ruleSchema.partial().omit({ repositoryId: true });

export async function updateRule(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const existing = await Rule.findById(id);
  if (!existing || !(await assertRepoOwnership(String(existing.repositoryId), req.user!.id))) {
    res.status(404).json({ error: "Rule not found" });
    return;
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const rule = await Rule.findByIdAndUpdate(id, parsed.data, { new: true });
  res.json({ rule });
}

export async function deleteRule(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const existing = await Rule.findById(id);
  if (!existing || !(await assertRepoOwnership(String(existing.repositoryId), req.user!.id))) {
    res.status(404).json({ error: "Rule not found" });
    return;
  }
  await Rule.findByIdAndDelete(id);
  res.status(204).send();
}
