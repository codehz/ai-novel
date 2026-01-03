import { LanguageModelV3 } from "@ai-sdk/provider";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { modelProviders, models } from "../db/schema";
import { wrapLanguageModelWithLogging } from "./ai-middleware";
import { createProviderClient } from "./provider-factory";

class AIRegistry {
  private static instance: AIRegistry;
  private cache: Map<string, LanguageModelV3> = new Map();

  private constructor() {}

  public static getInstance(): AIRegistry {
    if (!AIRegistry.instance) {
      AIRegistry.instance = new AIRegistry();
    }
    return AIRegistry.instance;
  }

  public async getModel(providerId: number, modelId: number): Promise<LanguageModelV3> {
    const cacheKey = `${providerId}:${modelId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const provider = await db.query.modelProviders.findFirst({
      where: eq(modelProviders.id, providerId),
    });

    const model = await db.query.models.findFirst({
      where: eq(models.id, modelId),
    });

    if (!provider || !model) {
      throw new Error("Provider or Model not found");
    }

    const client = createProviderClient(
      provider.providerType,
      provider.providerName,
      provider.apiKey,
      provider.apiEndpoint,
      provider.config as Record<string, unknown> | null,
    );

    // The client returned by createOpenAICompatible is a function that creates a model instance
    const rawModel = (client as (modelId: string) => LanguageModelV3)(model.modelName);

    const wrappedModel = wrapLanguageModelWithLogging(rawModel, {
      providerId,
      modelId,
      inputPrice: model.inputPrice ?? 0,
      outputPrice: model.outputPrice ?? 0,
      defaultParameters: (model.parameters as Record<string, unknown>) || {},
      configSnapshot: {
        provider: {
          type: provider.providerType,
          endpoint: provider.apiEndpoint,
          config: provider.config,
        },
        model: {
          name: model.modelName,
          parameters: model.parameters,
        },
      },
    });

    this.cache.set(cacheKey, wrappedModel);
    return wrappedModel;
  }

  public invalidateModel(providerId: number, modelId: number) {
    this.cache.delete(`${providerId}:${modelId}`);
  }

  public invalidateProvider(providerId: number) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${providerId}:`)) {
        this.cache.delete(key);
      }
    }
  }
}

export const aiRegistry = AIRegistry.getInstance();
