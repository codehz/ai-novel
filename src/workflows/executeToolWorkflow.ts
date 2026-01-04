import { getWritable } from "workflow";
import { StreamStepResult, ToolConfig } from "../lib/tool-types";
import markStreamComplete from "../steps/markStreamComplete";
import saveToolHistoryStep from "../steps/saveToolHistoryStep";
import streamJsonStep from "../steps/streamJsonStep";
import streamTextStep from "../steps/streamTextStep";

export default async function executeToolWorkflow(
  inputs: Record<string, unknown>,
  options: { modelId: number },
  config: ToolConfig,
) {
  "use workflow";

  const toolId = config.id;

  const systemPrompt = config.prompts?.systemTemplate || "你是一个专业的助手。";
  const userPrompt = buildUserPrompt(config.prompts?.userTemplate || "", inputs);

  const isText = config.outputSchema.type === "text";
  const writable = getWritable<StreamStepResult<unknown>>();

  let results: unknown;
  if (isText) {
    results = await streamTextStep(options.modelId, writable, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      callReason: `/tools/${toolId}`,
    });
  } else {
    results = await streamJsonStep(options.modelId, writable, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      callReason: `/tools/${toolId}`,
    });
  }

  await saveToolHistoryStep(toolId, inputs, results, options.modelId);
  await markStreamComplete(writable);
  return results;
}

function buildUserPrompt(template: string, inputs: Record<string, unknown>): string {
  let prompt = template;
  for (const [key, value] of Object.entries(inputs)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  }
  return prompt;
}
