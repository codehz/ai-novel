import { getAllTools } from "@/src/lib/tool-registry";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ToolIcon } from "./components/tool-icon";

export default function ToolsPage() {
  const tools = getAllTools();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">工具箱</h1>
        <p className="text-muted-foreground">聚合辅助创作的小工具，激发你的创作灵感。</p>
      </div>

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
    </div>
  );
}
