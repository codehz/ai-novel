"use server";

import { db } from "@/src/db";
import { modelProviders, models } from "@/src/db/schema";
import { eq } from "drizzle-orm";
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
