import { LanguageModelV3, LanguageModelV3CallOptions, SharedV3ProviderOptions } from "@ai-sdk/provider";
import { createCallLog } from "../actions/models";

export interface LoggingContext {
  providerName: string;
  modelName: string;
  inputPrice: number;
  outputPrice: number;
  configSnapshot: Record<string, unknown>;
  defaultParameters?: Record<string, unknown>;
}

export function wrapLanguageModelWithLogging(model: LanguageModelV3, context: LoggingContext): LanguageModelV3 {
  return {
    ...model,
    async doGenerate(options: LanguageModelV3CallOptions) {
      const startTime = Date.now();
      const providerOptions = options.providerOptions || {};
      const { logging: { callReason = "unknown" } = {}, ...restProviderOptions } = providerOptions;

      const sanitizedOptions: LanguageModelV3CallOptions = {
        ...options,
        temperature: options.temperature ?? (context.defaultParameters?.temperature as number),
        maxOutputTokens: options.maxOutputTokens ?? (context.defaultParameters?.maxTokens as number),
        topP: options.topP ?? (context.defaultParameters?.topP as number),
        providerOptions: restProviderOptions as SharedV3ProviderOptions,
      };

      try {
        const result = await model.doGenerate(sanitizedOptions);
        const durationMs = Date.now() - startTime;

        const inputTokens = result.usage.inputTokens.total ?? 0;
        const outputTokens = result.usage.outputTokens.total ?? 0;
        const inputCost = (inputTokens / 1000000) * context.inputPrice;
        const outputCost = (outputTokens / 1000000) * context.outputPrice;
        const totalCost = inputCost + outputCost;

        createCallLog({
          providerName: context.providerName,
          modelName: context.modelName,
          status: "success",
          input: options.prompt,
          output: result.content,
          inputTokens,
          outputTokens,
          inputCost,
          outputCost,
          totalCost,
          durationMs,
          callReason: callReason as string,
          modelConfigSnapshot: context.configSnapshot,
        }).catch(console.error);

        return result;
      } catch (error) {
        const durationMs = Date.now() - startTime;
        createCallLog({
          providerName: context.providerName,
          modelName: context.modelName,
          status: "error",
          input: options.prompt,
          errorMessage: error instanceof Error ? error.message : String(error),
          durationMs,
          callReason: callReason as string,
          modelConfigSnapshot: context.configSnapshot,
        }).catch(console.error);
        throw error;
      }
    },

    async doStream(options: LanguageModelV3CallOptions) {
      const startTime = Date.now();
      const providerOptions = options.providerOptions || {};
      const { logging: { callReason = "unknown" } = {}, ...restProviderOptions } = providerOptions;

      const sanitizedOptions: LanguageModelV3CallOptions = {
        ...options,
        temperature: options.temperature ?? (context.defaultParameters?.temperature as number),
        maxOutputTokens: options.maxOutputTokens ?? (context.defaultParameters?.maxTokens as number),
        topP: options.topP ?? (context.defaultParameters?.topP as number),
        providerOptions: restProviderOptions as SharedV3ProviderOptions,
      };

      const result = await model.doStream(sanitizedOptions);

      const originalStream = result.stream;
      const transformStream = new TransformStream({
        transform(chunk, controller) {
          if (chunk.type === "finish") {
            const durationMs = Date.now() - startTime;
            const inputTokens = chunk.usage.inputTokens.total ?? 0;
            const outputTokens = chunk.usage.outputTokens.total ?? 0;
            const inputCost = (inputTokens / 1000000) * context.inputPrice;
            const outputCost = (outputTokens / 1000000) * context.outputPrice;
            const totalCost = inputCost + outputCost;

            createCallLog({
              providerName: context.providerName,
              modelName: context.modelName,
              status: "success",
              input: options.prompt,
              output: { message: "Stream completed" },
              inputTokens,
              outputTokens,
              inputCost,
              outputCost,
              totalCost,
              durationMs,
              callReason: callReason as string,
              modelConfigSnapshot: context.configSnapshot,
            }).catch(console.error);
          }
          if (chunk.type === "error") {
            const durationMs = Date.now() - startTime;
            createCallLog({
              providerName: context.providerName,
              modelName: context.modelName,
              status: "error",
              input: options.prompt,
              errorMessage: String(chunk.error),
              durationMs,
              callReason: callReason as string,
              modelConfigSnapshot: context.configSnapshot,
            }).catch(console.error);
          }
          controller.enqueue(chunk);
        },
      });

      return {
        ...result,
        stream: originalStream.pipeThrough(transformStream),
      };
    },
  };
}
