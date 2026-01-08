"use server";

import { getWorld } from "@workflow/core/runtime";
import { WorkflowRunStatus } from "@workflow/world";
import { revalidatePath } from "next/cache";

export interface WorkflowActionResult {
  success: boolean;
  message: string;
}

export async function pauseWorkflowRun(runId: string): Promise<WorkflowActionResult> {
  try {
    const world = getWorld();
    await world.runs.pause(runId);
    revalidatePath("/workflows");
    revalidatePath(`/workflows/${runId}`);
    return { success: true, message: "工作流已暂停" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "暂停工作流失败";
    return { success: false, message };
  }
}

export async function resumeWorkflowRun(runId: string): Promise<WorkflowActionResult> {
  try {
    const world = getWorld();
    await world.runs.resume(runId);
    revalidatePath("/workflows");
    revalidatePath(`/workflows/${runId}`);
    return { success: true, message: "工作流已恢复" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "恢复工作流失败";
    return { success: false, message };
  }
}

export async function cancelWorkflowRun(runId: string): Promise<WorkflowActionResult> {
  try {
    const world = getWorld();
    await world.runs.cancel(runId);
    revalidatePath("/workflows");
    revalidatePath(`/workflows/${runId}`);
    return { success: true, message: "工作流已取消" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "取消工作流失败";
    return { success: false, message };
  }
}

export async function loadMoreWorkflowRuns(cursor: string, status?: WorkflowRunStatus) {
  const world = getWorld();
  const result = await world.runs.list({
    status,
    pagination: {
      cursor,
      limit: 20,
      sortOrder: "desc",
    },
  });
  return result;
}
