"use server";

import { db } from "@/src/db";
import { modelCallLogs, modelProviders, models } from "@/src/db/schema";
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

export async function upsertProvider(data: typeof modelProviders.$inferInsert) {
  if (data.id) {
    await db
      .update(modelProviders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modelProviders.id, data.id));
  } else {
    await db.insert(modelProviders).values(data);
  }
  revalidatePath("/models");
}

export async function deleteProvider(id: number) {
  await db.delete(modelProviders).where(eq(modelProviders.id, id));
  revalidatePath("/models");
}

export async function toggleProviderStatus(id: number, isEnabled: boolean) {
  await db.update(modelProviders).set({ isEnabled, updatedAt: new Date() }).where(eq(modelProviders.id, id));
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
  } else {
    await db.insert(models).values(data);
  }
  revalidatePath("/models");
}

export async function deleteModel(id: number) {
  await db.delete(models).where(eq(models.id, id));
  revalidatePath("/models");
}

export async function toggleModelStatus(id: number, isEnabled: boolean) {
  await db.update(models).set({ isEnabled, updatedAt: new Date() }).where(eq(models.id, id));
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
  providerId?: number;
  modelId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where = [];
  if (filters?.providerId) where.push(eq(modelCallLogs.providerId, filters.providerId));
  if (filters?.modelId) where.push(eq(modelCallLogs.modelId, filters.modelId));
  if (filters?.status) where.push(eq(modelCallLogs.status, filters.status));
  if (filters?.startDate) where.push(gte(modelCallLogs.createdAt, filters.startDate));
  if (filters?.endDate) where.push(lte(modelCallLogs.createdAt, filters.endDate));

  return await db.query.modelCallLogs.findMany({
    where: where.length > 0 ? and(...where) : undefined,
    orderBy: [desc(modelCallLogs.createdAt)],
    limit: filters?.limit ?? 50,
    offset: filters?.offset ?? 0,
    with: {
      provider: true,
    },
  });
}

export async function getCallStatistics(filters?: {
  providerId?: number;
  modelId?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const where = [];
  if (filters?.providerId) where.push(eq(modelCallLogs.providerId, filters.providerId));
  if (filters?.modelId) where.push(eq(modelCallLogs.modelId, filters.modelId));
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
