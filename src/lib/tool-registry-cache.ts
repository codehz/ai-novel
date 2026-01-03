import { eq } from "drizzle-orm";
import { db } from "../db";
import { toolConfigs } from "../db/schema";
import { ToolConfig } from "./tool-types";

class ToolRegistryCache {
  private static instance: ToolRegistryCache;
  private toolCache: Map<string, ToolConfig> = new Map();
  private allToolsCache: ToolConfig[] | null = null;

  private constructor() {}

  public static getInstance(): ToolRegistryCache {
    if (!ToolRegistryCache.instance) {
      ToolRegistryCache.instance = new ToolRegistryCache();
    }
    return ToolRegistryCache.instance;
  }

  public async getToolConfig(toolId: string): Promise<ToolConfig | undefined> {
    if (this.toolCache.has(toolId)) {
      return this.toolCache.get(toolId);
    }

    const config = await db.query.toolConfigs.findFirst({
      where: eq(toolConfigs.toolId, toolId),
    });

    if (!config) return undefined;

    const tool: ToolConfig = {
      id: config.toolId,
      name: config.name,
      description: config.description,
      icon: config.icon,
      version: config.version,
      inputSchema: config.inputSchema,
      outputSchema: config.outputSchema,
      prompts: config.prompts || undefined,
    };

    this.toolCache.set(toolId, tool);
    return tool;
  }

  public async getAllTools(): Promise<ToolConfig[]> {
    if (this.allToolsCache) {
      return this.allToolsCache;
    }

    const configs = await db.query.toolConfigs.findMany({
      where: eq(toolConfigs.isEnabled, true),
    });

    const tools: ToolConfig[] = configs.map((config) => ({
      id: config.toolId,
      name: config.name,
      description: config.description,
      icon: config.icon,
      version: config.version,
      inputSchema: config.inputSchema,
      outputSchema: config.outputSchema,
      prompts: config.prompts || undefined,
    }));

    this.allToolsCache = tools;
    return tools;
  }

  public invalidateTool(toolId: string) {
    this.toolCache.delete(toolId);
    this.allToolsCache = null;
  }

  public invalidateAll() {
    this.toolCache.clear();
    this.allToolsCache = null;
  }
}

export const toolRegistryCache = ToolRegistryCache.getInstance();
