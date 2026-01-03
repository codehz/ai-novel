import { getToolConfig } from "@/src/lib/tool-registry";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolExecutor } from "../components/tool-executor";
import { ToolIcon } from "../components/tool-icon";

interface PageProps {
  params: Promise<{ toolId: string }>;
}

export default async function ToolPage({ params }: PageProps) {
  const { toolId } = await params;
  const config = await getToolConfig(toolId);

  if (!config) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工具箱
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ToolIcon name={config.icon} className="w-6 h-6 text-primary" />
            </div>
            {config.name}
          </h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>

      <ToolExecutor toolId={toolId} config={config} />
    </div>
  );
}
