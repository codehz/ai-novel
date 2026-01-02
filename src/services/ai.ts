import { db } from "@/src/db";
import { modelProviders, models } from "@/src/db/schema";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { type ModelMessage } from "@ai-sdk/provider-utils";
import { generateText, streamText, type LanguageModel } from "ai";
import { eq } from "drizzle-orm";

export interface AIConfig {
  modelId: number;
  providerId: number;
}

export interface AIInput {
  messages: ModelMessage[];
  system?: string;
}

export interface AIResponse {
  content: string;
  messages?: ModelMessage[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
}

export class AIService {
  private model: LanguageModel | null = null;
  private modelConfig: typeof models.$inferSelect | null = null;

  constructor(private config: AIConfig) {}

  async init() {
    const [modelData] = await db.select().from(models).where(eq(models.id, this.config.modelId)).limit(1);

    if (!modelData) {
      throw new Error(`Model with ID ${this.config.modelId} not found`);
    }

    const [providerData] = await db
      .select()
      .from(modelProviders)
      .where(eq(modelProviders.id, this.config.providerId))
      .limit(1);

    if (!providerData) {
      throw new Error(`Provider with ID ${this.config.providerId} not found`);
    }

    this.modelConfig = modelData;

    const openai = createOpenAICompatible({
      name: providerData.providerType,
      baseURL: providerData.apiEndpoint || "https://api.openai.com/v1",
      ...(providerData.apiKey ? { apiKey: providerData.apiKey } : {}),
    });

    this.model = openai(modelData.modelName);
  }

  private calculateCost(inputTokens: number, outputTokens: number) {
    const inputPrice = this.modelConfig?.inputPrice || 0;
    const outputPrice = this.modelConfig?.outputPrice || 0;

    const inputCost = (inputTokens / 1_000_000) * inputPrice;
    const outputCost = (outputTokens / 1_000_000) * outputPrice;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }

  async generate(input: AIInput, options: Record<string, unknown> = {}) {
    if (!this.model) await this.init();

    const result = await generateText({
      model: this.model!,
      messages: input.messages,
      system: input.system,
      ...((this.modelConfig?.parameters as Record<string, unknown>) || {}),
      ...options,
    });

    const inputTokens = result.usage.inputTokens || 0;
    const outputTokens = result.usage.outputTokens || 0;

    const cost = this.calculateCost(inputTokens, outputTokens);

    // 构造完整的消息历史，包含助手响应
    const responseMessages: ModelMessage[] = [
      ...input.messages,
      {
        role: "assistant",
        content: result.text,
      } as ModelMessage,
    ];

    return {
      content: result.text,
      messages: responseMessages,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: result.usage.totalTokens || 0,
      },
      cost,
    };
  }

  async stream(input: AIInput, options: Record<string, unknown> = {}) {
    if (!this.model) await this.init();

    return streamText({
      model: this.model!,
      messages: input.messages,
      system: input.system,
      ...((this.modelConfig?.parameters as Record<string, unknown>) || {}),
      ...options,
    });
  }

  getCostCalculator() {
    return (inputTokens: number, outputTokens: number) => this.calculateCost(inputTokens, outputTokens);
  }
}
