import { StreamStepResult } from "@/shared/tool-types";
import { ModelMessage, streamText } from "ai";
import { getWorkflowMetadata } from "workflow";
import { aiRegistry } from "../lib/ai-registry";

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
