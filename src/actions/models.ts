"use server";

import { db } from "@/src/db";
import { modelCallLogs, modelProviders, models } from "@/src/db/schema";
import { aiRegistry } from "@/src/lib/ai-registry";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Provider Actions ---

export async function getProviders() {
  return await db.query.modelProviders.findMany({
    with: {
      models: true,
    },
  });
}

export interface ProviderWithModels {
  providerId: number;
  providerName: string;
  models: Array<{
    modelId: number;
    displayName: string;
    modelName: string;
    inputPrice: number;
    outputPrice: number;
  }>;
}

export async function getAvailableModels(): Promise<ProviderWithModels[]> {
  const providers = await db.query.modelProviders.findMany({
    where: (fields) => eq(fields.isEnabled, true),
    with: {
      models: {
        where: (fields) => eq(fields.isEnabled, true),
      },
    },
  });

  return providers.map((provider) => ({
    providerId: provider.id,
    providerName: provider.providerName,
    models: provider.models.map((model) => ({
      modelId: model.id,
      displayName: model.displayName,
      modelName: model.modelName,
      inputPrice: model.inputPrice || 0,
      outputPrice: model.outputPrice || 0,
    })),
  }));
}

export async function upsertProvider(data: typeof modelProviders.$inferInsert) {
  if (data.id) {
    await db
      .update(modelProviders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modelProviders.id, data.id));
    await aiRegistry.invalidateProvider(data.id);
  } else {
    await db.insert(modelProviders).values(data);
  }
  revalidatePath("/models");
}

export async function deleteProvider(id: number) {
  await db.delete(modelProviders).where(eq(modelProviders.id, id));
  await aiRegistry.invalidateProvider(id);
  revalidatePath("/models");
}

export async function toggleProviderStatus(id: number, isEnabled: boolean) {
  await db.update(modelProviders).set({ isEnabled, updatedAt: new Date() }).where(eq(modelProviders.id, id));
  await aiRegistry.invalidateProvider(id);
  revalidatePath("/models");
}

// --- Model Actions ---

export async function getModels() {
  return await db.query.models.findMany({
    with: {
      provider: true,
    },
  });
}

export async function upsertModel(data: typeof models.$inferInsert) {
  if (data.id) {
    await db
      .update(models)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(models.id, data.id));
    aiRegistry.invalidateModel(data.id);
  } else {
    await db.insert(models).values(data);
  }
  revalidatePath("/models");
}

export async function deleteModel(id: number) {
  const model = await db.query.models.findFirst({ where: eq(models.id, id) });
  if (model) {
    await db.delete(models).where(eq(models.id, id));
    aiRegistry.invalidateModel(id);
  }
  revalidatePath("/models");
}

export async function toggleModelStatus(id: number, isEnabled: boolean) {
  const model = await db.query.models.findFirst({ where: eq(models.id, id) });
  if (model) {
    await db.update(models).set({ isEnabled, updatedAt: new Date() }).where(eq(models.id, id));
    aiRegistry.invalidateModel(id);
  }
  revalidatePath("/models");
}

export async function getEnabledModel() {
  return await db.query.models.findFirst({
    where: eq(models.isEnabled, true),
    with: {
      provider: true,
    },
  });
}

// --- Call Log Actions ---

export async function createCallLog(data: typeof modelCallLogs.$inferInsert) {
  const [result] = await db.insert(modelCallLogs).values(data).returning();
  revalidatePath("/models");
  return result;
}

export async function updateCallLog(id: number, data: Partial<typeof modelCallLogs.$inferInsert>) {
  await db
    .update(modelCallLogs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(modelCallLogs.id, id));
  revalidatePath("/models");
}

export async function getCallLogs(filters?: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  workflowRunId?: string;
  limit?: number;
  offset?: number;
}) {
  const where = [];
  if (filters?.status) where.push(eq(modelCallLogs.status, filters.status));
  if (filters?.startDate) where.push(gte(modelCallLogs.createdAt, filters.startDate));
  if (filters?.endDate) where.push(lte(modelCallLogs.createdAt, filters.endDate));
  if (filters?.workflowRunId) where.push(eq(modelCallLogs.workflowRunId, filters.workflowRunId));

  return await db.query.modelCallLogs.findMany({
    where: where.length > 0 ? and(...where) : undefined,
    orderBy: [desc(modelCallLogs.createdAt)],
    limit: filters?.limit ?? 50,
    offset: filters?.offset ?? 0,
  });
}

export async function getCallStatistics(filters?: { startDate?: Date; endDate?: Date }) {
  const where = [];
  if (filters?.startDate) where.push(gte(modelCallLogs.createdAt, filters.startDate));
  if (filters?.endDate) where.push(lte(modelCallLogs.createdAt, filters.endDate));

  const condition = where.length > 0 ? and(...where) : undefined;

  const stats = await db
    .select({
      count: sql<number>`count(*)`,
      totalTokens: sql<number>`coalesce(sum(${modelCallLogs.inputTokens} + ${modelCallLogs.outputTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${modelCallLogs.totalCost}), 0)`,
      successCount: sql<number>`count(case when ${modelCallLogs.status} = 'success' then 1 end)`,
      errorCount: sql<number>`count(case when ${modelCallLogs.status} = 'error' then 1 end)`,
    })
    .from(modelCallLogs)
    .where(condition);

  return stats[0];
}
