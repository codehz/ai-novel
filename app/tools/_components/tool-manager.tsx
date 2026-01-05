"use client";

import { AddCard } from "@/components/add-card";
import { ItemCard } from "@/components/item-card";
import { deleteToolConfig, toggleToolStatus } from "@/src/actions/tools";
import { ToolConfig } from "@/src/lib/tool-types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { startTransition, useState } from "react";
import { ToolForm } from "./tool-form";
import { ToolIcon } from "./tool-icon";

interface ToolManagerProps {
  tools: ToolConfig[];
}

export function ToolManager({ tools }: ToolManagerProps) {
  const [editingTool, setEditingTool] = useState<ToolConfig | null | undefined>(undefined);
  const [showDisabled, setShowDisabled] = useState(false);

  const enabledTools = tools.filter((t) => t.isEnabled);
  const disabledTools = tools.filter((t) => !t.isEnabled);

  const handleEdit = (tool: ToolConfig) => {
    startTransition(() => {
      setEditingTool(tool);
    });
  };

  const handleAdd = () => {
    startTransition(() => {
      setEditingTool(null);
    });
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AddCard onClick={handleAdd} label="新建工具" />
        {enabledTools.map((tool) => renderToolCard(tool, true))}
      </div>

      {disabledTools.length > 0 && (
        <div className="pt-4 border-t border-border">
          <button
            onClick={() => setShowDisabled(!showDisabled)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            {showDisabled ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            已停用的工具 ({disabledTools.length})
          </button>

          {showDisabled && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {disabledTools.map((tool) => renderToolCard(tool, false))}
            </div>
          )}
        </div>
      )}

      {editingTool !== undefined && (
        <ToolForm tool={editingTool || undefined} onClose={() => startTransition(() => setEditingTool(undefined))} />
      )}
    </div>
  );
}
