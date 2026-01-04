import { StreamStepResult } from "../lib/tool-types";

export default async function markStreamComplete<T>(writable: WritableStream<StreamStepResult<T>>) {
  "use step";
  const writer = writable.getWriter();
  try {
    await writer.write({ type: "complete" });
    await writer.close();
  } finally {
    writer.releaseLock();
  }
}
