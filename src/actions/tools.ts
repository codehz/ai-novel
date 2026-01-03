/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/src/db";
import { getToolExecutor } from "@/src/lib/tool-executors";
import { toolHistoryStore } from "@/src/lib/tool-history-store";
import { getToolConfig } from "@/src/lib/tool-registry";
import { ToolExecutionResult, ToolHistoryItem } from "@/src/lib/tool-types";
import { eq } from "drizzle-orm";

export async function executeTool(
  toolId: string,
  inputs: Record<string, any>,
  providerId?: number,
  modelId?: number,
): Promise<ToolExecutionResult> {
  const config = getToolConfig(toolId);
  if (!config) {
    return { success: false, error: "Tool not found" };
  }

  const executor = getToolExecutor(toolId);
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
