"use client";

import { AddCard } from "@/components/add-card";
import { DetailsCard } from "@/components/details-card";
import { ItemCard } from "@/components/item-card";
import { useOverlayQueue } from "@/components/overlay";
import { ToolConfig } from "@/shared/tool-types";
import { deleteToolConfig, toggleToolStatus } from "@/src/actions/tools";
import { AutoTransition } from "@codehz/auto-transition";
import { ToolForm } from "./tool-form";
import { ToolIcon } from "./tool-icon";

interface ToolManagerProps {
  tools: ToolConfig[];
}

export function ToolManager({ tools }: ToolManagerProps) {
  const queue = useOverlayQueue();

  const enabledTools = tools.filter((t) => t.isEnabled);
  const disabledTools = tools.filter((t) => !t.isEnabled);

  const handleEdit = (tool: ToolConfig) => {
    queue.show(<ToolForm tool={tool} />);
  };

  const handleAdd = () => {
    queue.show(<ToolForm />);
  };

  const handleDelete = async (toolId: string) => {
    try {
      await deleteToolConfig(toolId);
    } catch (error) {
      console.error("Failed to delete tool:", error);
      alert("删除失败");
    }
  };

  const handleToggleStatus = async (toolId: string, currentStatus: boolean) => {
    try {
      await toggleToolStatus(toolId, !currentStatus);
    } catch (error) {
      console.error("Failed to toggle tool status:", error);
      alert("操作失败");
    }
  };

  const renderToolCard = (tool: ToolConfig, clickable: boolean) => (
    <ItemCard
      key={tool.id}
      href={clickable ? `/tools/${tool.id}` : undefined}
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <ToolIcon name={tool.icon ?? undefined} className="w-4 h-4 text-primary" />
          </div>
          {tool.name}
        </div>
      }
      subtitle={tool.id}
      isEnabled={tool.isEnabled}
      onToggle={() => handleToggleStatus(tool.id, !!tool.isEnabled)}
      onEdit={() => handleEdit(tool)}
      onDelete={() => handleDelete(tool.id)}
      deleteConfirmMessage="确定要删除这个工具吗？这将同时删除所有相关的历史记录。"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">v{tool.version}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tool.description}</p>
    </ItemCard>
  );

  return (
    <AutoTransition as="div" className="space-y-6 relative">
      <AutoTransition as="div" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 relative">
        <AddCard onClick={handleAdd} label="新建工具" />
        {enabledTools.map((tool) => renderToolCard(tool, true))}
      </AutoTransition>

      {disabledTools.length > 0 && (
        <DetailsCard label={`已停用的工具 (${disabledTools.length})`}>
          <AutoTransition as="div" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 relative">
            {disabledTools.map((tool) => renderToolCard(tool, false))}
          </AutoTransition>
        </DetailsCard>
      )}
    </AutoTransition>
  );
}
