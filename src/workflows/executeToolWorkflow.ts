import { getWritable } from "workflow";
import { ToolConfig } from "../lib/tool-types";
import saveToolHistoryStep from "../steps/saveToolHistoryStep";
import streamJsonStep, { markStreamJsonComplete, StreamJsonStepResult } from "../steps/streamJsonStep";

export default async function executeToolWorkflow(
  inputs: Record<string, unknown>,
  options: { modelId: number },
  config: ToolConfig,
) {
  "use workflow";

  const toolId = config.id;

  const systemPrompt = config.prompts?.systemTemplate || "你是一个专业的助手。";
  const userPrompt = buildUserPrompt(config.prompts?.userTemplate || "", inputs);

  const writable = getWritable<StreamJsonStepResult<unknown>>();
  const results = await streamJsonStep(options.modelId, writable, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    callReason: `/tools/${toolId}`,
  });
  await saveToolHistoryStep(toolId, inputs, results, options.modelId);
  await markStreamJsonComplete(writable);
  return results;
}

function buildUserPrompt(template: string, inputs: Record<string, unknown>): string {
  let prompt = template;
  for (const [key, value] of Object.entries(inputs)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  }
  return prompt;
}
