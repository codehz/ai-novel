import { getAllToolConfigs } from "@/src/actions/tools";
import { getAllTools } from "@/src/lib/tool-registry";
import { ArrowRight, LayoutGrid, Settings } from "lucide-react";
import Link from "next/link";
import { ToolIcon } from "./components/tool-icon";
import { ToolManager } from "./components/tool-manager";

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ manage?: string }> }) {
  const isManageMode = (await searchParams).manage === "true";
  const tools = isManageMode ? await getAllToolConfigs() : await getAllTools();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">工具箱</h1>
          <p className="text-muted-foreground">聚合辅助创作的小工具，激发你的创作灵感。</p>
        </div>
        <Link
          href={isManageMode ? "/tools" : "/tools?manage=true"}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium"
        >
          {isManageMode ? (
            <>
              <LayoutGrid size={18} />
              <span>使用模式</span>
            </>
          ) : (
            <>
              <Settings size={18} />
              <span>管理模式</span>
            </>
          )}
        </Link>
      </div>

      {isManageMode ? (
        <ToolManager tools={tools} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group relative flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ToolIcon name={tool.icon} className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{tool.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
