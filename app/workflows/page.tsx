import { getWorld } from "@workflow/core/runtime";
import { WorkflowRunsList } from "./_components/workflow-runs-list";

export default async function WorkflowsPage() {
  const world = getWorld();
  const runsResponse = await world.runs.list({});
  const runs = runsResponse.data || [];

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
        <WorkflowRunsList runs={runs} />
      </section>
    </div>
  );
}
