# Copilot 使用说明 — ai-novel

目的：让 AI 编码代理能即刻理解架构、数据流与开发手感，减少踩坑时间。

## 快速运行

- 必需：bun；所有命令在仓库根目录执行。
- 常用脚本：`bun install`，`bun run dev`，`bun run build`，`bun run start`，`bun run lint`，`bun run format[:check]`（见 [package.json](package.json)）。
- 数据库文件名从 `.env` 文件中的 `DB_FILE_NAME` 环境变量读取，bun 会自动加载 `.env` 文件；未设置会在 [src/db/index.ts](src/db/index.ts) 处直接抛错。
- Drizzle 迁移在应用启动时自动执行：`migrate(db, { migrationsFolder: "./drizzle" })`，避免在只读/无共享文件系统环境中误触。

## 架构与数据流

- **Next.js App Router**：根布局在 [app/layout.tsx](app/layout.tsx)，提供顶部导航/页脚。
- **AI 工作流引擎**：基于 `workflow` 库。使用 `"use workflow"` 标记工作流函数，`"use step"` 标记原子步骤函数。
  - 示例：[src/workflows/executeToolWorkflow.ts](src/workflows/executeToolWorkflow.ts) 编排步骤，[src/steps/generateTextStep.ts](src/steps/generateTextStep.ts) 执行 AI 调用。
- **AI 模型注册表**：`AIRegistry` ([src/lib/ai-registry.ts](src/lib/ai-registry.ts)) 单例类，提供懒加载的模型客户端缓存。
  - 获取模型：`await aiRegistry.getModel(modelId)`。
- **AI 中间件**：`wrapLanguageModelWithLogging` ([src/lib/ai-middleware.ts](src/lib/ai-middleware.ts)) 自动记录日志、计算成本并注入默认参数。
  - 调用时需传入 `callReason`（如 `"/tools/seed-expander"`）用于日志分类。
- **数据库**：bun-sqlite + Drizzle（schema [src/db/schema.ts](src/db/schema.ts)）。
  - 时间戳：使用 `sql`(unixepoch())`作为默认值，更新时手动设置`updatedAt: new Date()`。
  - JSON 字段：`config` (provider) 和 `parameters` (model) 存储动态配置。

## 前端约定与模式

- **目录结构约定（Next.js App Router）**：
  - 公共组件放入顶层 `components/` 目录。
  - 页面特定组件放入相应页面的 `_components/` 子目录中，避免在 `app/` 下创建 `components/` 目录。
  - 示例：公共组件如 `item-card.tsx` 在 [components/item-card.tsx](components/item-card.tsx)，页面组件如模型表单在 [app/models/\_components/model-form.tsx](app/models/_components/model-form.tsx)。
- **数据流**：Server Component 负责查询（如 `getProviders()`），UI 交互在 `"use client"` 组件内完成。
- **Server Actions**：集中在 [src/actions/](src/actions/)。变更后必须调用 `revalidatePath` 刷新 UI，并视情况调用 `aiRegistry.invalidate*` 清除缓存.
- **UI 组件**：
  - 使用 [components/item-card.tsx](components/item-card.tsx) 展示列表项，支持开关、编辑、删除。
  - 使用 [components/add-card.tsx](components/add-card.tsx) 作为添加按钮。
  - 状态变更推荐使用 `startTransition` 包裹，以保持 UI 响应。
- **表单**：`ProviderForm`/`ModelForm` 直接调用 server action；插入/更新都用 `upsert*` 模式。

## 工具箱系统

- **配置驱动**：工具由 `ToolConfig` 定义，包含 `inputSchema`（输入表单）、`outputSchema`（渲染方式）和 `prompts`（提示词模板）。
- **执行流程**：`executeToolWorkflow` 接收输入，填充模板，调用 AI，解析 JSON 结果，并记录到 `tool_histories`。
- **历史记录**：使用 `saveToolHistoryStep` 异步保存执行结果，便于后续审计和重用。

## 开发提示

- **新增工具**：在 `toolConfigs` 表中注册，并确保 `inputSchema` 与前端 `DynamicForm` 兼容。
- **模型调用**：始终通过 `aiRegistry` 获取模型，不要直接实例化提供商客户端。
- **样式**：Tailwind v4，使用 CSS 变量控制主题。图标统一使用 `lucide-react`。
- **调试**：查看 [app/logs/page.tsx](app/logs/page.tsx) 获取详细的模型调用日志和成本统计。
