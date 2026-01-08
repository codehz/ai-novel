import { getWorld } from "@workflow/core/runtime";
import { WorkflowRunStatus } from "@workflow/world";
import { WorkflowRunsList } from "./_components/workflow-runs-list";

export default async function WorkflowsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: WorkflowRunStatus;
  }>;
}) {
  const params = await searchParams;
  const selectedStatus = params.status as WorkflowRunStatus | undefined;

  const world = getWorld();
  const runsResponse = await world.runs.list({ status: selectedStatus });
  let runs = runsResponse.data || [];

  // 按创建时间倒序排序
  runs = runs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">工作流运行</h1>
            <p className="text-muted-foreground mt-1">查看和管理所有的工作流运行历史。</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <WorkflowRunsList runs={runs} selectedStatus={selectedStatus || "all"} />
      </section>
    </div>
  );
}
