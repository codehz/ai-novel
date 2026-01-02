import { db } from "@/src/db";
import { modelCallLogs } from "@/src/db/schema";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import { eq } from "drizzle-orm";

export class CallLogger {
  async startLog(params: {
    modelId: number;
    providerId: number;
    input: string | ModelMessage[];
    callReason: string;
    metadata?: Record<string, unknown>;
  }) {
    // 将输入序列化为 JSON 字符串
    const serializedInput = typeof params.input === "string" ? params.input : JSON.stringify(params.input);

    const [log] = await db
      .insert(modelCallLogs)
      .values({
        modelId: params.modelId,
        providerId: params.providerId,
        input: serializedInput,
        callReason: params.callReason,
        metadata: params.metadata || {},
        status: "pending",
      })
      .returning({ id: modelCallLogs.id });
    return log.id;
  }

  async completeLog(
    logId: number,
    params: {
      output: string | ModelMessage[];
      usage: {
        inputTokens: number;
        outputTokens: number;
      };
      cost: {
        inputCost: number;
        outputCost: number;
        totalCost: number;
      };
    },
  ) {
    // 将输出序列化为 JSON 字符串
    const serializedOutput = typeof params.output === "string" ? params.output : JSON.stringify(params.output);

    await db
      .update(modelCallLogs)
      .set({
        output: serializedOutput,
        inputTokens: params.usage.inputTokens,
        outputTokens: params.usage.outputTokens,
        inputCost: params.cost.inputCost,
        outputCost: params.cost.outputCost,
        totalCost: params.cost.totalCost,
        status: "success",
        updatedAt: new Date(),
      })
      .where(eq(modelCallLogs.id, logId));
  }

  async failLog(logId: number, error: string) {
    await db
      .update(modelCallLogs)
      .set({
        errorMessage: error,
        status: "error",
        updatedAt: new Date(),
      })
      .where(eq(modelCallLogs.id, logId));
  }
}
