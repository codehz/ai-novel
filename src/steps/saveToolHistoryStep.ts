import { toolHistoryStore } from "../lib/tool-history-store";

export default async function saveToolHistoryStep(
  toolId: string,
  inputs: Record<string, unknown>,
  result: unknown,
  modelId: number,
) {
  "use step";
  await toolHistoryStore.save({
    toolId,
    inputs,
    outputs: result,
    timestamp: Date.now(),
    modelId,
  });
}
