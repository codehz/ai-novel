import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function ToolsPage() {
  const tools = [
    {
      id: "seed-expander",
      name: "种子想法扩展",
      description: "给AI一个简短的“种子”，生成10-20个不同的情节方向、冲突点或结局变体。",
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      href: "/tools/seed-expander",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">工具箱</h1>
        <p className="text-muted-foreground">聚合辅助创作的小工具，激发你的创作灵感。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group relative flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/10">{tool.icon}</div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{tool.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
