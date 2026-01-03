import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createProviderClient(
  providerType: string,
  providerName: string,
  apiKey: string | null,
  apiEndpoint: string | null,
  config: Record<string, unknown> | null,
) {
  switch (providerType) {
    case "openai-compatible":
      if (!apiEndpoint) {
        throw new Error(`API endpoint is required for ${providerType}`);
      }
      return createOpenAICompatible({
        name: providerName,
        apiKey: apiKey ?? undefined,
        baseURL: apiEndpoint,
        ...(config || {}),
      });
    default:
      throw new Error(`Unsupported provider type: ${providerType}`);
  }
}
