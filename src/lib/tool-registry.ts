import { ToolConfig } from "@/shared/tool-types";
import { toolRegistryCache } from "./tool-registry-cache";

export async function getToolConfig(toolId: string): Promise<ToolConfig | undefined> {
  return toolRegistryCache.getToolConfig(toolId);
}

export async function getAllTools(): Promise<ToolConfig[]> {
  return toolRegistryCache.getAllTools();
}
