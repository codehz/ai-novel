import { StreamStepResult } from "../lib/tool-types";

export default async function reportStreamError<T>(
  writable: WritableStream<StreamStepResult<T>>,
  errorMessage: string,
) {
  "use step";
  const writer = writable.getWriter();
  try {
    await writer.write({ type: "error", error: errorMessage });
    await writer.close();
  } finally {
    writer.releaseLock();
  }
}
