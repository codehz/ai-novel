/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToolExecutionResult } from "../tool-types";
import { executeSeedExpander } from "./seed-expander";

type ToolExecutorFn = (
  inputs: Record<string, any>,
  options?: { providerId?: number; modelId?: number },
) => Promise<ToolExecutionResult>;

export const TOOL_EXECUTORS: Record<string, ToolExecutorFn> = {
  "seed-expander": executeSeedExpander,
};

export function getToolExecutor(toolId: string): ToolExecutorFn | undefined {
  return TOOL_EXECUTORS[toolId];
}
