"use client";

import { upsertModel } from "@/src/actions/models";
import { models } from "@/src/db/schema";
import { X } from "lucide-react";
import { useState } from "react";

interface ModelFormProps {
  model?: typeof models.$inferSelect | null;
  providerId: number;
  onClose: () => void;
}

export function ModelForm({ model, providerId, onClose }: ModelFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: model?.id,
    providerId: providerId,
    modelName: model?.modelName || "",
    displayName: model?.displayName || "",
    description: model?.description || "",
    inputPrice: model?.inputPrice || 0,
    outputPrice: model?.outputPrice || 0,
    isEnabled: model?.isEnabled ?? true,
    parameters: model?.parameters || {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertModel(formData as typeof models.$inferInsert);
      onClose();
    } catch (error) {
      console.error("Failed to save model:", error);
      alert("保存失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl dark:shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
          <h3 className="text-xl font-bold">{model ? "编辑模型" : "添加模型"}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">显示名称</label>
            <input
              required
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="例如: GPT-4o"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">模型标识符 (API Name)</label>
            <input
              required
              type="text"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              placeholder="例如: gpt-4o"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="模型描述..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">输入价格 ($/1k)</label>
              <input
                type="number"
                step="0.000001"
                value={formData.inputPrice || 0}
                onChange={(e) => setFormData({ ...formData, inputPrice: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">输出价格 ($/1k)</label>
              <input
                type="number"
                step="0.000001"
                value={formData.outputPrice || 0}
                onChange={(e) => setFormData({ ...formData, outputPrice: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="modelIsEnabled"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="modelIsEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              启用该模型
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
