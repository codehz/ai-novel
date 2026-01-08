import { getToolConfig } from "@/src/lib/tool-registry";
import executeToolWorkflow from "@/src/workflows/executeToolWorkflow";
import { NextRequest } from "next/server";
import { start } from "workflow/api";

export async function POST(req: NextRequest) {
  const { toolId, inputs, modelId } = await req.json();

  const config = await getToolConfig(toolId);
  if (!config) {
    return new Response("Tool not found", { status: 404 });
  }

  const run = await start(executeToolWorkflow, [inputs, { modelId }, config]);
  const runId = run.runId;
  const readable = run.getReadable();

  // Log workflow run ID for audit and tracing purposes
  console.debug(`[Tool Execution] toolId=${toolId}, runId=${runId}`);

  const encoder = new TextEncoder();

  return new Response(
    readable.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        },
      }),
    ),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    },
  );
}
