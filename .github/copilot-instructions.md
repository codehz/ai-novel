# Copilot 使用说明 — ai-novel

目的：让 AI 编码代理能即刻理解架构、数据流与开发手感，减少踩坑时间。

## 快速开始

- **必需工具**：bun；所有命令在仓库根目录执行。
- **常用命令**：`bun install`、`bun run dev`、`bun run build`、`bun run start`、`bun run lint`、`bun run format`。
- **环境变量**：`DB_FILE_NAME`（数据库文件路径，bun 自动从 `.env` 加载；未设置在应用启动时会抛错）。
- **数据库迁移**：Drizzle 在应用启动时自动执行，无需手动操作。

## 核心架构

### 分层设计

1. **前端层**（Next.js App Router）：Server Components 负责数据查询，`"use client"` 组件处理交互
2. **工作流层**（`@workflow/world-local`）：定义原子性计算单元，支持异步流和错误恢复
3. **AI 层**（AI SDK + 中间件）：统一模型访问、日志、成本计算
4. **数据层**（SQLite + Drizzle）：持久化存储，自动时间戳管理

### 目录结构约定

- **前端代码**：位于 `app/`、`components/` 和 `hooks/` 目录
  - `app/`：Next.js 页面路由和布局
  - `components/`：可复用的 UI 组件
  - `hooks/`：自定义 React hooks
- **后端代码**：位于 `src/` 目录
  - `src/actions/`：Server Actions
  - `src/db/`：数据库相关代码
  - `src/lib/`：工具函数和库
  - `src/workflows/`：工作流定义
  - `src/steps/`：工作流步骤定义
- **共享代码**：位于 `shared/` 目录
  - `shared/tool-types.ts`：前后端共享的类型定义（如 `ToolConfig`、`InputSchema`、`OutputSchema` 等）

### AI 工作流引擎

- **标记**：`"use workflow"` 标记工作流函数，`"use step"` 标记原子步骤。
- **编排**：工作流函数协调多个步骤执行（如流式 JSON 解析、保存历史、报告错误）。
- **流式处理**：使用 `getWritable()` 返回流结果，消费端通过 Server-Sent Events 接收。

### AI 模型管理

- **注册表**：`AIRegistry` 单例，提供模型客户端的懒加载缓存。获取模型：`await aiRegistry.getModel(modelId)`。
- **中间件**：`wrapLanguageModelWithLogging` 自动记录调用日志、计算成本、注入默认参数；需传入 `callReason`（如 `"/tools/seed-expander"`）用于日志分类。
- **提供商工厂**：根据 `providerType` 创建 OpenAI 兼容客户端。

### 数据库设计（SQLite + Drizzle）

- **模式**：定义 5 个主表：
  - `modelProviders`：供应商配置（`providerType` 如 "openai-compatible"、`apiKey`、`config` JSON）
  - `models`：模型定义（`parameters` JSON 存默认参数、`inputPrice`/`outputPrice` 用于成本计算）
  - `modelCallLogs`：调用历史（每次 AI 调用自动记录，含 token 数和成本）
  - `toolConfigs`：工具配置（`inputSchema`/`outputSchema`/`prompts` JSON 定义工具界面和行为）
  - `toolHistories`：工具执行历史
- **时间戳约定**：使用 `sql(unixepoch())` 作为 `createdAt` 默认值，更新时手动设置 `updatedAt: new Date()`。
- **缓存失效**：修改模型/工具后调用 `aiRegistry.invalidateModel(id)` 或 `toolRegistryCache.invalidateTool(toolId)` 清除缓存。

## 前端约定

### 目录结构（Next.js App Router）

- **公共组件**：`components/` 目录存放可复用的 UI 组件。
- **页面组件**：`app/[page]/_components/` 子目录存放页面级组件。避免在 `app/` 下创建 `components/` 目录。

### React组件约定

- **组件定义**：优先使用 named function 形式定义 React 组件，例如 `function ComponentName() {}`，而不是 `const ComponentName = () => {}`。
- **类型导入**：React 类型（如 `ReactNode`、`FormEvent`、`ChangeEvent` 等）应从 `react` 直接导入，而不是使用 `React.` 前缀。例如：
  - 使用 `import { useState, type ReactNode } from "react";`
  - 而不是 `children: React.ReactNode;`
- **事件处理**：对于组件中的事件处理器，特别是涉及异步操作的处理器，必须使用 `useEventHandler` hook 包装，以避免闭包陷阱和重复调用问题。例如：
  - 使用 `import { useEventHandler } from "@/hooks/useEventHandler";`
  - 在组件中：`const handleClick = useEventHandler((event) => { /* 处理逻辑 */ });`
  - 这样可以确保始终调用最新的回调函数，并可选择性地防止异步操作期间的重复调用。

### 数据流与 Server Actions

- **查询**：Server Components 调用 DB，使用 `db.query.*` 方法（Drizzle 关系查询）。
- **变更**：集中在 `src/actions/` 的 `"use server"` 函数（如 `upsertToolConfig`、`executeTool`）。
- **缓存更新**：变更后必须调用 `revalidatePath("/path")` 刷新 UI，视情况调用 `aiRegistry.invalidate*` 或 `toolRegistryCache.invalidateTool()`。
- **UI 响应性**：使用 `startTransition` 包裹 server action 调用，保持按钮/表单无阻塞。

### 工具系统工作流

1. **定义工具**：在 DB 的 `toolConfigs` 表中注册 `ToolConfig`（含 `inputSchema`、`outputSchema`、`prompts`）。
2. **执行**：前端调用 `/api/tools/execute` 触发工作流 → `executeToolWorkflow` 填充提示词 → AI 调用 → 结果流式返回。
3. **历史记录**：`saveToolHistoryStep` 异步保存到 `toolHistories` 表，前端可查看和复用历史。

### 常用公共组件

#### CodeBlock

用途：展示格式化代码块。Props：`content`、`maxHeight`（默认 `"max-h-48"`）、`language`、`className`。

#### CopyButton

用途：一键复制功能。Props：`text`、`label`（默认 `"复制"`）、`feedbackDuration`（默认 2000）、`size`（"sm"|"md"）、`className`。

#### formatJson

用途：安全序列化对象为 JSON 字符串。签名：`formatJson(data: unknown): string`。

#### Button

用途：通用按钮。Props：`variant`（"primary"|"destructive"等）、`size`（"sm"|"md"|"lg"）、`loading`、`loadingText`、`disabled`。

#### IconButton

用途：图标按钮。Props：`color`（"primary"|"destructive"|"default"）、`shape`（"round"|"square"）。

#### TextInput

用途：文本输入框。Props：`className` 及所有原生 input 属性。
