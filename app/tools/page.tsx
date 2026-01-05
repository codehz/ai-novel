import { getAllToolConfigs } from "@/src/actions/tools";
import { ToolManager } from "./_components/tool-manager";

export default async function ToolsPage() {
  const tools = await getAllToolConfigs();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">工具箱</h1>
          <p className="text-muted-foreground">聚合辅助创作的小工具，激发你的创作灵感。</p>
        </div>
      </div>

      <ToolManager tools={tools} />
    </div>
  );
}
