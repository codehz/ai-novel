import { StreamStepResult } from "@/shared/tool-types";
import { ModelMessage, streamText } from "ai";
import { parse } from "jsonriver";
import { getWorkflowMetadata } from "workflow";
import { aiRegistry } from "../lib/ai-registry";

export default async function streamJsonStep<T>(
  modelId: number,
  writable: WritableStream<StreamStepResult<T>>,
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

  // Get workflow run ID if executing within a workflow
  let workflowRunId: string | undefined;
  try {
    const metadata = getWorkflowMetadata();
    workflowRunId = metadata.workflowRunId;
  } catch {
    // Not in a workflow context, workflowRunId remains undefined
  }

  const result = streamText({
    model,
    messages,
    providerOptions: {
      logging: {
        callReason: callReason || `unknown`,
        workflowRunId,
      },
    },
  });
  const writer = writable.getWriter();
  try {
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
  } finally {
    writer.releaseLock();
  }
}
