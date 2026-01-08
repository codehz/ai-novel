# Copilot 使用说明 — ai-novel

目的：让 AI 编码代理能即刻理解架构、数据流与开发手感，减少踩坑时间。

## 快速开始

- **必需工具**：bun；所有命令在仓库根目录执行。
- **常用命令**：`bun install`、`bun run dev`、`bun run build`、`bun run start`、`bun run lint`、`bun run format`（见 [package.json](package.json)）。
- **环境变量**：`DB_FILE_NAME`（数据库文件路径，bun 自动从 `.env` 加载；未设置会在 [src/db/index.ts](src/db/index.ts) 抛错）。
- **数据库迁移**：Drizzle 在应用启动时自动执行，无需手动操作。

## 核心架构

### 分层设计

1. **前端层**（Next.js App Router）：Server Components 负责数据查询，`"use client"` 组件处理交互
2. **工作流层**（`@workflow/world-local`）：定义原子性计算单元，支持异步流和错误恢复
3. **AI 层**（AI SDK + 中间件）：统一模型访问、日志、成本计算
4. **数据层**（SQLite + Drizzle）：持久化存储，自动时间戳管理

### AI 工作流引擎

- **标记**：`"use workflow"` 标记工作流函数，`"use step"` 标记原子步骤。
- **编排示例**：[src/workflows/executeToolWorkflow.ts](src/workflows/executeToolWorkflow.ts) 协调 [src/steps/streamJsonStep.ts](src/steps/streamJsonStep.ts)、[src/steps/saveToolHistoryStep.ts](src/steps/saveToolHistoryStep.ts) 等步骤。
- **流式处理**：使用 `getWritable()` 返回流结果，消费端通过 Server-Sent Events（[app/api/tools/execute/route.ts](app/api/tools/execute/route.ts)）接收。

### AI 模型管理

- **注册表**：`AIRegistry` ([src/lib/ai-registry.ts](src/lib/ai-registry.ts)) 单例，提供模型客户端的懒加载缓存。获取模型：`await aiRegistry.getModel(modelId)`。
- **中间件**：`wrapLanguageModelWithLogging` ([src/lib/ai-middleware.ts](src/lib/ai-middleware.ts)) 自动记录调用日志、计算成本、注入默认参数；需传入 `callReason`（如 `"/tools/seed-expander"`）用于日志分类。
- **提供商工厂**：[src/lib/provider-factory.ts](src/lib/provider-factory.ts) 根据 `providerType` 创建 OpenAI 兼容客户端。

### 数据库设计（SQLite + Drizzle）

- **模式**：[src/db/schema.ts](src/db/schema.ts) 定义 5 个主表：
  - `modelProviders`：供应商配置（`providerType` 如 "openai-compatible"、`apiKey`、`config` JSON）
  - `models`：模型定义（`parameters` JSON 存默认参数、`inputPrice`/`outputPrice` 用于成本计算）
  - `modelCallLogs`：调用历史（每次 AI 调用自动记录，含 token 数和成本）
  - `toolConfigs`：工具配置（`inputSchema`/`outputSchema`/`prompts` JSON 定义工具界面和行为）
  - `toolHistories`：工具执行历史
- **时间戳约定**：使用 `sql(unixepoch())` 作为 `createdAt` 默认值，更新时手动设置 `updatedAt: new Date()`。
- **缓存失效**：修改模型/工具后调用 `aiRegistry.invalidateModel(id)` 或 `toolRegistryCache.invalidateTool(toolId)` 清除缓存。

## 前端约定

### 目录结构（Next.js App Router）

- **公共组件**：[components/](components/) 目录（如 [components/item-card.tsx](components/item-card.tsx)、[components/form-field.tsx](components/form-field.tsx)）。
- **页面组件**：`app/[page]/_components/` 子目录（如 [app/models/\_components/model-form.tsx](app/models/_components/model-form.tsx)）。避免在 `app/` 下创建 `components/` 目录。

### 数据流与 Server Actions

- **查询**：Server Components 调用 DB，使用 `db.query.*` 方法（Drizzle 关系查询）。
- **变更**：集中在 [src/actions/](src/actions/) 的 `"use server"` 函数（如 `upsertToolConfig`、`executeTool`）。
- **缓存更新**：变更后必须调用 `revalidatePath("/path")` 刷新 UI，视情况调用 `aiRegistry.invalidate*` 或 `toolRegistryCache.invalidateTool()`。
- **UI 响应性**：使用 `startTransition` 包裹 server action 调用，保持按钮/表单无阻塞。

### 工具系统工作流

1. **定义工具**：在 DB 的 `toolConfigs` 表中注册 `ToolConfig`（含 `inputSchema`、`outputSchema`、`prompts`）。
2. **执行**：前端调用 `/api/tools/execute` 触发工作流 → `executeToolWorkflow` 填充提示词 → AI 调用 → 结果流式返回。
3. **历史记录**：`saveToolHistoryStep` 异步保存到 `toolHistories` 表，前端可查看和复用历史。

## 开发模式

- **样式**：Tailwind v4 + CSS 变量主题（见 [app/globals.css](app/globals.css)）；图标使用 `lucide-react`。
- **调试**：[app/logs/page.tsx](app/logs/page.tsx) 展示完整模型调用日志、token 统计和成本。

## 关键文件参考

| 用途               | 文件                                                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 工作流编排         | [src/workflows/executeToolWorkflow.ts](src/workflows/executeToolWorkflow.ts)                                                                                   |
| 流式 JSON/文本步骤 | [src/steps/streamJsonStep.ts](src/steps/streamJsonStep.ts)、[src/steps/streamTextStep.ts](src/steps/streamTextStep.ts)                                         |
| 模型访问和日志     | [src/lib/ai-registry.ts](src/lib/ai-registry.ts)、[src/lib/ai-middleware.ts](src/lib/ai-middleware.ts)                                                         |
| 数据库交互         | [src/db/schema.ts](src/db/schema.ts)、[src/db/index.ts](src/db/index.ts)                                                                                       |
| Server Actions     | [src/actions/tools.ts](src/actions/tools.ts)、[src/actions/models.ts](src/actions/models.ts)                                                                   |
| 工具 UI 编辑       | [app/tools/\_components/tool-form.tsx](app/tools/_components/tool-form.tsx)、[app/tools/\_components/dynamic-form.tsx](app/tools/_components/dynamic-form.tsx) |
| 工具执行 UI        | [app/tools/[toolId]/page.tsx](app/tools/[toolId]/page.tsx)                                                                                                     |
