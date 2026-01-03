import { ToolHistoryItem } from "./tool-types";

export interface ToolExecutionStore {
  save(item: ToolHistoryItem): Promise<void>;
  get(toolId: string): Promise<ToolHistoryItem[]>;
  delete(id: string): Promise<boolean>;
  clear(toolId: string): Promise<boolean>;
}

class InMemoryToolHistoryStore implements ToolExecutionStore {
  private history: ToolHistoryItem[] = [];
  private maxItems = 50;

  async save(item: ToolHistoryItem): Promise<void> {
    this.history = [item, ...this.history].slice(0, this.maxItems);
  }

  async get(toolId: string): Promise<ToolHistoryItem[]> {
    return this.history.filter((item) => item.toolId === toolId);
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.history.length;
    this.history = this.history.filter((item) => item.id !== id);
    return this.history.length !== initialLength;
  }

  async clear(toolId: string): Promise<boolean> {
    this.history = this.history.filter((item) => item.toolId !== toolId);
    return true;
  }
}

// Singleton instance
export const toolHistoryStore = new InMemoryToolHistoryStore();
