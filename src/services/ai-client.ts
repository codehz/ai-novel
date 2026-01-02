import { AIService } from "./ai";
import { CallLogger } from "./call-logger";

export interface AIClientOptions {
  modelId: number;
  providerId: number;
  callReason: string;
  metadata?: Record<string, unknown>;
}

export class AIClient {
  private aiService: AIService;
  private logger: CallLogger;

  constructor(private options: AIClientOptions) {
    this.aiService = new AIService({
      modelId: options.modelId,
      providerId: options.providerId,
    });
    this.logger = new CallLogger();
  }

  async generateText(prompt: string, options: Record<string, unknown> = {}) {
    const logId = await this.logger.startLog({
      modelId: this.options.modelId,
      providerId: this.options.providerId,
      input: prompt,
      callReason: this.options.callReason,
      metadata: this.options.metadata,
    });

    try {
      const result = await this.aiService.generate(prompt, options);
      await this.logger.completeLog(logId, {
        output: result.content,
        usage: {
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
        },
        cost: result.cost,
      });
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logger.failLog(logId, errorMessage);
      throw error;
    }
  }

  async streamText(prompt: string, options: Record<string, unknown> = {}) {
    const logId = await this.logger.startLog({
      modelId: this.options.modelId,
      providerId: this.options.providerId,
      input: prompt,
      callReason: this.options.callReason,
      metadata: this.options.metadata,
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalOnFinish = options.onFinish as ((event: any) => Promise<void> | void) | undefined;

      const enhancedOptions = {
        ...options,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFinish: async (event: any) => {
          const inputTokens = event.usage.inputTokens || 0;
          const outputTokens = event.usage.outputTokens || 0;

          const costCalculator = this.aiService.getCostCalculator();
          const cost = costCalculator(inputTokens, outputTokens);

          await this.logger.completeLog(logId, {
            output: event.text,
            usage: {
              inputTokens,
              outputTokens,
            },
            cost: cost,
          });

          if (originalOnFinish) {
            await originalOnFinish(event);
          }
        },
      };

      return await this.aiService.stream(prompt, enhancedOptions);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logger.failLog(logId, errorMessage);
      throw error;
    }
  }
}

export function createAIClient(options: AIClientOptions) {
  return new AIClient(options);
}
