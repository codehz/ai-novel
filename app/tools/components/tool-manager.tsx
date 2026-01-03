"use client";

import { AddCard } from "@/app/components/add-card";
import { ItemCard } from "@/app/components/item-card";
import { deleteToolConfig, toggleToolStatus } from "@/src/actions/tools";
import { ToolConfig } from "@/src/lib/tool-types";
import { useState } from "react";
import { ToolForm } from "./tool-form";
import { ToolIcon } from "./tool-icon";

interface ToolManagerProps {
  tools: ToolConfig[];
}

export function ToolManager({ tools }: ToolManagerProps) {
  const [editingTool, setEditingTool] = useState<ToolConfig | null | undefined>(undefined);

  const handleEdit = (tool: ToolConfig) => {
    setEditingTool(tool);
  };

  const handleAdd = () => {
    setEditingTool(null);
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ItemCard
            key={tool.id}
            title={tool.name}
            subtitle={tool.id}
            isEnabled={tool.isEnabled}
            onToggle={() => handleToggleStatus(tool.id, !!tool.isEnabled)}
            onEdit={() => handleEdit(tool)}
            onDelete={() => handleDelete(tool.id)}
            deleteConfirmMessage="确定要删除这个工具吗？这将同时删除所有相关的历史记录。"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <ToolIcon name={tool.icon} className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                v{tool.version}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tool.description}</p>
          </ItemCard>
        ))}

        <AddCard onClick={handleAdd} label="新建工具" />
      </div>

      {editingTool !== undefined && (
        <ToolForm tool={editingTool || undefined} onClose={() => setEditingTool(undefined)} />
      )}
    </div>
  );
}
