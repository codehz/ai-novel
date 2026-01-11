/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToolConfig, ToolExecutionResult } from "@/shared/tool-types";
import { generateText } from "ai";
import { aiRegistry } from "../ai-registry";

/**
 * 通用工具执行器，根据工具配置调用 AI 模型
 */
export async function executeGenericTool(
  inputs: Record<string, any>,
  options: { modelId: number },
  config: ToolConfig,
): Promise<ToolExecutionResult> {
  const toolId = config.id;
  try {
    const model = await aiRegistry.getModel(options.modelId);

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
