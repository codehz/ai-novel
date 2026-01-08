"use server";

import { db } from "@/src/db";
import { toolConfigs } from "@/src/db/schema";
import { toolHistoryStore } from "@/src/lib/tool-history-store";
import { getToolConfig } from "@/src/lib/tool-registry";
import { toolRegistryCache } from "@/src/lib/tool-registry-cache";
import {
  InputSchema,
  OutputSchema,
  PromptSet,
  ToolConfig,
  ToolExecutionResult,
  ToolHistoryItem,
} from "@/src/lib/tool-types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { start } from "workflow/api";
import executeToolWorkflow from "../workflows/executeToolWorkflow";

export async function executeTool(
  toolId: string,
  inputs: Record<string, unknown>,
  modelId: number,
): Promise<ToolExecutionResult> {
  const config = await getToolConfig(toolId);
  if (!config) {
    return { success: false, error: "Tool not found" };
  }
  try {
    const run = await start(executeToolWorkflow, [inputs, { modelId }, config]);
    const runId = run.runId;
    const data = await run.returnValue;

    // Log workflow run ID for audit and tracing purposes
    console.debug(`[Tool Execution] toolId=${toolId}, runId=${runId}`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`Error executing tool workflow for ${toolId}:`, error);
    return {
      success: false,
      error: `${error}`,
    };
  }
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

export async function upsertToolConfig(data: {
  toolId: string;
  name: string;
  description: string;
  icon?: string | null;
  version: string;
  inputSchema: InputSchema;
  outputSchema: OutputSchema;
  prompts?: PromptSet | null;
  isEnabled?: boolean;
}) {
  const { toolId, ...rest } = data;

  // Validate hue values in outputSchema.categories
  if (rest.outputSchema.categories) {
    for (const categoryConfig of rest.outputSchema.categories) {
      if (categoryConfig.hue !== undefined) {
        const hue = categoryConfig.hue;
        if (typeof hue !== "number" || hue < 0 || hue > 360) {
          throw new Error(
            `Invalid hue value for category "${categoryConfig.id || "unknown"}": must be between 0 and 360`,
          );
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
