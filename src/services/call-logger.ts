import { db } from "@/src/db";
import { modelCallLogs } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export class CallLogger {
  async startLog(params: {
    modelId: number;
    providerId: number;
    input: string;
    callReason: string;
    metadata?: Record<string, unknown>;
  }) {
    const [log] = await db
      .insert(modelCallLogs)
      .values({
        modelId: params.modelId,
        providerId: params.providerId,
        input: params.input,
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
      output: string;
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
    await db
      .update(modelCallLogs)
      .set({
        output: params.output,
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
