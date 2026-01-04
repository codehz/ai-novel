import { ModelMessage, streamText } from "ai";
import { parse } from "jsonriver";
import { aiRegistry } from "../lib/ai-registry";

export type StreamJsonStepResult<T> = { type: "item"; data: T } | { type: "complete" };

export default async function streamJsonStep<T>(
  modelId: number,
  writable: WritableStream<StreamJsonStepResult<T>>,
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
  let results: T[] = [];
  const iterator = parse(result.textStream, {
    completeCallback: (value, path) => {
      const segments = path.segments();
      if (segments.length === 1 && typeof segments[0] === "number") {
        writer.write({ type: "item", data: value as T });
      }
    },
  });
  for await (const value of iterator) {
    results = value as T[];
  }
  return results;
}

export async function markStreamJsonComplete<T>(writable: WritableStream<StreamJsonStepResult<T>>) {
  "use step";
  const writer = writable.getWriter();
  await writer.write({ type: "complete" });
  await writer.close();
}
