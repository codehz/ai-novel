import { toolRegistryCache } from "./tool-registry-cache";
import { ToolConfig } from "./tool-types";

export async function getToolConfig(toolId: string): Promise<ToolConfig | undefined> {
  return toolRegistryCache.getToolConfig(toolId);
}

export async function getAllTools(): Promise<ToolConfig[]> {
  return toolRegistryCache.getAllTools();
}
