import { generateText, ModelMessage } from "ai";
import { aiRegistry } from "../lib/ai-registry";

export default async function generateTextStep(
  modelId: number,
  {
    messages,
    callReason,
  }: {
    messages: Array<ModelMessage>;
    callReason?: string;
  },
) {
  "use step";

  const model = await aiRegistry.getModel(modelId);

  const result = await generateText({
    model,
    messages,
    providerOptions: {
      logging: {
        callReason: callReason || `unknown`,
      },
    },
  });
  return { text: result.text, finishReason: result.finishReason };
}
