/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/src/db";
import { toolConfigs } from "@/src/db/schema";
import { getToolExecutor } from "@/src/lib/tool-executors";
import { toolHistoryStore } from "@/src/lib/tool-history-store";
import { getToolConfig } from "@/src/lib/tool-registry";
import { toolRegistryCache } from "@/src/lib/tool-registry-cache";
import { ToolConfig, ToolExecutionResult, ToolHistoryItem } from "@/src/lib/tool-types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function executeTool(
  toolId: string,
  inputs: Record<string, any>,
  providerId?: number,
  modelId?: number,
): Promise<ToolExecutionResult> {
  const config = await getToolConfig(toolId);
  if (!config) {
    return { success: false, error: "Tool not found" };
  }

  const executor = await getToolExecutor(toolId);
  if (!executor) {
    return { success: false, error: "Tool executor not implemented" };
  }

  // Validate inputs (basic validation based on schema)
  for (const field of config.inputSchema.fields) {
    const value = inputs[field.name];
    if (field.required && (value === undefined || value === null || value === "")) {
      return { success: false, error: `Field ${field.label || field.name} is required` };
    }
    if (field.type === "textarea" || field.type === "text") {
      if (typeof value === "string") {
        if (field.minLength && value.length < field.minLength) {
          return {
            success: false,
            error: `Field ${field.label || field.name} must be at least ${field.minLength} characters`,
          };
        }
        if (field.maxLength && value.length > field.maxLength) {
          return {
            success: false,
            error: `Field ${field.label || field.name} must be at most ${field.maxLength} characters`,
          };
        }
      }
    }
  }

  // Fetch model info if provided
  let providerName: string | undefined;
  let modelName: string | undefined;

  if (providerId && modelId) {
    const provider = await db.query.modelProviders.findFirst({
      where: (fields) => eq(fields.id, providerId),
      with: {
        models: {
          where: (fields) => eq(fields.id, modelId),
        },
      },
    });

    if (provider && provider.models.length > 0) {
      providerName = provider.providerName;
      modelName = provider.models[0].displayName;
    }
  }

  // Execute tool
  const result = await executor(inputs, { providerId, modelId });

  if (result.success && result.data) {
    // Save to history
    await toolHistoryStore.save({
      toolId,
      inputs,
      outputs: result.data,
      timestamp: Date.now(),
      providerId,
      modelId,
      providerName,
      modelName,
    });
  }

  return result;
}

export async function getToolHistory(toolId: string): Promise<ToolHistoryItem[]> {
  return toolHistoryStore.get(toolId);
}

export async function deleteToolHistory(id: number): Promise<boolean> {
  return toolHistoryStore.delete(id);
}

export async function clearToolHistory(toolId: string): Promise<boolean> {
  return toolHistoryStore.clear(toolId);
}

export async function getAllToolConfigs(): Promise<ToolConfig[]> {
  const configs = await db.query.toolConfigs.findMany();
  return configs.map((config) => ({
    id: config.toolId,
    name: config.name,
    description: config.description,
    icon: config.icon,
    version: config.version,
    inputSchema: config.inputSchema,
    outputSchema: config.outputSchema,
    prompts: config.prompts || undefined,
    isEnabled: config.isEnabled,
  }));
}

export async function upsertToolConfig(data: any) {
  const { toolId, ...rest } = data;

  // Validate hue values in outputSchema.categories
  if (rest.outputSchema?.categories) {
    for (const [categoryId, config] of Object.entries(rest.outputSchema.categories)) {
      const categoryConfig = config as any;
      if (categoryConfig.hue !== undefined) {
        const hue = categoryConfig.hue;
        if (typeof hue !== "number" || hue < 0 || hue > 360) {
          throw new Error(`Invalid hue value for category "${categoryId}": must be between 0 and 360`);
        }
      }
    }
  }

  await db
    .insert(toolConfigs)
    .values({
      toolId,
      ...rest,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: toolConfigs.toolId,
      set: {
        ...rest,
        updatedAt: new Date(),
      },
    });

  toolRegistryCache.invalidateTool(toolId);
  revalidatePath("/tools");
}

export async function deleteToolConfig(toolId: string) {
  await db.delete(toolConfigs).where(eq(toolConfigs.toolId, toolId));
  toolRegistryCache.invalidateTool(toolId);
  revalidatePath("/tools");
}

export async function toggleToolStatus(toolId: string, isEnabled: boolean) {
  await db.update(toolConfigs).set({ isEnabled, updatedAt: new Date() }).where(eq(toolConfigs.toolId, toolId));

  toolRegistryCache.invalidateTool(toolId);
  revalidatePath("/tools");
}
