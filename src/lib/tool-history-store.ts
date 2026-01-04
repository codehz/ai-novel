import { db } from "@/src/db";
import { models, toolHistories } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import { ToolHistoryItem } from "./tool-types";

export interface ToolExecutionStore {
  save(item: Omit<ToolHistoryItem, "id" | "modelName" | "providerName">): Promise<void>;
  get(toolId: string): Promise<ToolHistoryItem[]>;
  delete(id: number): Promise<boolean>;
  clear(toolId: string): Promise<boolean>;
}

class DatabaseToolHistoryStore implements ToolExecutionStore {
  async save(item: Omit<ToolHistoryItem, "id" | "modelName" | "providerName">): Promise<void> {
    let modelName: string | undefined;
    let providerName: string | undefined;

    if (item.modelId) {
      const model = await db.query.models.findFirst({
        where: eq(models.id, item.modelId),
        with: {
          provider: true,
        },
      });
      if (model) {
        modelName = model.displayName;
        providerName = model.provider.providerName;
      }
    }

    await db.insert(toolHistories).values({
      toolId: item.toolId,
      inputs: item.inputs,
      outputs: item.outputs,
      timestamp: item.timestamp,
      modelId: item.modelId,
      modelName,
      providerName,
    });
  }

  async get(toolId: string): Promise<ToolHistoryItem[]> {
    const results = await db.query.toolHistories.findMany({
      where: (fields) => eq(fields.toolId, toolId),
      orderBy: [desc(toolHistories.id)],
    });
    return results as ToolHistoryItem[];
  }

  async delete(id: number): Promise<boolean> {
    await db.delete(toolHistories).where(eq(toolHistories.id, id));
    return true;
  }

  async clear(toolId: string): Promise<boolean> {
    await db.delete(toolHistories).where(eq(toolHistories.toolId, toolId));
    return true;
  }
}

// Singleton instance
export const toolHistoryStore = new DatabaseToolHistoryStore();
