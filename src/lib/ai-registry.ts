import { LanguageModelV3 } from "@ai-sdk/provider";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { models } from "../db/schema";
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

  public async getModel(modelId: number): Promise<LanguageModelV3> {
    const cacheKey = String(modelId);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const model = await db.query.models.findFirst({
      where: eq(models.id, modelId),
      with: {
        provider: true,
      },
    });

    if (!model || !model.provider) {
      throw new Error("Model or Provider not found");
    }

    const provider = model.provider;

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
      providerName: provider.providerName,
      modelName: model.modelName,
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

  public invalidateModel(modelId: number) {
    this.cache.delete(String(modelId));
  }

  public async invalidateProvider(providerId: number) {
    const providerModels = await db.query.models.findMany({
      where: eq(models.providerId, providerId),
    });
    for (const model of providerModels) {
      this.cache.delete(String(model.id));
    }
  }
}

export const aiRegistry = AIRegistry.getInstance();
