/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText } from "ai";
import { aiRegistry } from "../ai-registry";
import { getToolConfig } from "../tool-registry";
import { ToolExecutionResult } from "../tool-types";

type ToolExecutorFn = (
  inputs: Record<string, any>,
  options?: { providerId?: number; modelId?: number },
) => Promise<ToolExecutionResult>;

/**
 * 通用工具执行器，根据工具配置调用 AI 模型
 */
async function executeGenericTool(
  toolId: string,
  inputs: Record<string, any>,
  options?: { providerId?: number; modelId?: number },
): Promise<ToolExecutionResult> {
  const config = await getToolConfig(toolId);
  if (!config) {
    return { success: false, error: "找不到工具配置" };
  }

  if (!options?.providerId || !options?.modelId) {
    return { success: false, error: "请选择 AI 模型以执行此工具。" };
  }

  try {
    const model = await aiRegistry.getModel(options.providerId, options.modelId);

    const systemPrompt = config.prompts?.systemTemplate || "你是一个专业的助手。";
    let userPrompt = config.prompts?.userTemplate || "";

    // 替换占位符，例如 {{field}}
    for (const [key, value] of Object.entries(inputs)) {
      userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      providerOptions: {
        logging: {
          callReason: `/tools/${toolId}`,
        },
      },
    });

    // 尝试提取 JSON（如果模型包含了 markdown 代码块）
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonStr = match[1];
      }
    }

    const data = JSON.parse(jsonStr);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error(`Error executing tool ${toolId}:`, error);
    return {
      success: false,
      error: `执行失败: ${error.message || "未知错误"}`,
    };
  }
}

export const TOOL_EXECUTORS: Record<string, ToolExecutorFn> = {
  // 如果有特殊的工具逻辑，可以在这里覆盖
};

export async function getToolExecutor(toolId: string): Promise<ToolExecutorFn | undefined> {
  // 优先检查是否有自定义执行器
  if (TOOL_EXECUTORS[toolId]) {
    return TOOL_EXECUTORS[toolId];
  }

  // 否则，如果工具在配置中存在，则使用通用执行器
  const config = await getToolConfig(toolId);
  if (config) {
    return (inputs, options) => executeGenericTool(toolId, inputs, options);
  }

  return undefined;
}
