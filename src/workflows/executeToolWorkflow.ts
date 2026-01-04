import { ToolConfig } from "../lib/tool-types";
import generateTextStep from "../steps/generateTextStep";
import saveToolHistoryStep from "../steps/saveToolHistoryStep";

export default async function executeToolWorkflow(
  inputs: Record<string, unknown>,
  options: { modelId: number },
  config: ToolConfig,
) {
  "use workflow";

  const toolId = config.id;

  const systemPrompt = config.prompts?.systemTemplate || "你是一个专业的助手。";
  const userPrompt = buildUserPrompt(config.prompts?.userTemplate || "", inputs);

  const { text } = await generateTextStep(options.modelId, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    callReason: `/tools/${toolId}`,
  });

  let jsonStr = text.trim();
  if (jsonStr.startsWith("```")) {
    const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      jsonStr = match[1];
    }
  }

  const data = JSON.parse(jsonStr);

  await saveToolHistoryStep(toolId, inputs, data, options.modelId);

  return data;
}

function buildUserPrompt(template: string, inputs: Record<string, unknown>): string {
  let prompt = template;
  for (const [key, value] of Object.entries(inputs)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  }
  return prompt;
}
