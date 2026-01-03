import { db } from "@/src/db";
import { toolHistories } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import { ToolHistoryItem } from "./tool-types";

export interface ToolExecutionStore {
  save(item: Omit<ToolHistoryItem, "id">): Promise<void>;
  get(toolId: string): Promise<ToolHistoryItem[]>;
  delete(id: number): Promise<boolean>;
  clear(toolId: string): Promise<boolean>;
}

class DatabaseToolHistoryStore implements ToolExecutionStore {
  async save(item: Omit<ToolHistoryItem, "id">): Promise<void> {
    await db.insert(toolHistories).values({
      toolId: item.toolId,
      inputs: item.inputs,
      outputs: item.outputs,
      timestamp: item.timestamp,
      providerId: item.providerId,
      modelId: item.modelId,
      modelName: item.modelName,
      providerName: item.providerName,
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
