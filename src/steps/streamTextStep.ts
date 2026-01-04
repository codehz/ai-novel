import { ModelMessage, streamText } from "ai";
import { aiRegistry } from "../lib/ai-registry";
import { StreamStepResult } from "../lib/tool-types";

export default async function streamTextStep(
  modelId: number,
  writable: WritableStream<StreamStepResult<string>>,
  {
    messages,
    callReason,
  }: {
    messages: Array<ModelMessage>;
    callReason?: string;
  },
): Promise<string> {
  "use step";

  const model = await aiRegistry.getModel(modelId);

  const result = streamText({
    model,
    messages,
    providerOptions: {
      logging: {
        callReason: callReason || `unknown`,
      },
    },
  });

  const writer = writable.getWriter();
  try {
    let fullText = "";

    for await (const chunk of result.textStream) {
      fullText += chunk;
      await writer.write({ type: "item", data: chunk });
    }

    return fullText;
  } finally {
    writer.releaseLock();
  }
}
