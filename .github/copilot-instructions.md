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

### React组件约定

- **组件定义**：优先使用 named function 形式定义 React 组件，例如 `function ComponentName() {}`，而不是 `const ComponentName = () => {}`。

### 数据流与 Server Actions

- **查询**：Server Components 调用 DB，使用 `db.query.*` 方法（Drizzle 关系查询）。
- **变更**：集中在 [src/actions/](src/actions/) 的 `"use server"` 函数（如 `upsertToolConfig`、`executeTool`）。
- **缓存更新**：变更后必须调用 `revalidatePath("/path")` 刷新 UI，视情况调用 `aiRegistry.invalidate*` 或 `toolRegistryCache.invalidateTool()`。
- **UI 响应性**：使用 `startTransition` 包裹 server action 调用，保持按钮/表单无阻塞。

### 工具系统工作流

1. **定义工具**：在 DB 的 `toolConfigs` 表中注册 `ToolConfig`（含 `inputSchema`、`outputSchema`、`prompts`）。
2. **执行**：前端调用 `/api/tools/execute` 触发工作流 → `executeToolWorkflow` 填充提示词 → AI 调用 → 结果流式返回。
3. **历史记录**：`saveToolHistoryStep` 异步保存到 `toolHistories` 表，前端可查看和复用历史。

### 常用公共组件

#### CodeBlock 组件

- **文件**：[components/code-block.tsx](components/code-block.tsx)
- **用途**：以格式化代码块形式展示内容，支持自定义高度和样式。
- **Props**：
  - `content: string` — 待显示的内容
  - `maxHeight?: string` — 最大高度，默认 `"max-h-48"`
  - `language?: string` — 代码语言标记（保留作未来扩展）
  - `className?: string` — 额外 CSS 类名
- **使用示例**：
  ```tsx
  <CodeBlock content={formatJson(data)} maxHeight="max-h-96" />
  ```

#### CopyButton 组件

- **文件**：[components/copy-button.tsx](components/copy-button.tsx)
- **用途**：提供一键复制功能，点击时复制文本到剪贴板，并显示反馈状态（Copy → Check 图标）。
- **Props**：
  - `text: string` — 待复制的内容
  - `label?: string` — 按钮显示文本，默认 `"复制"`
  - `feedbackDuration?: number` — 成功反馈时长（ms），默认 `2000`
  - `size?: "sm" | "md"` — 图标大小，默认 `"sm"`（sm: w-3 h-3，md: w-4 h-4）
  - `className?: string` — 额外 CSS 类名
- **使用示例**：
  ```tsx
  <CopyButton text={JSON.stringify(data)} label="复制" />
  ```

#### formatJson 工具函数

- **文件**：[components/lib/format.ts](components/lib/format.ts)
- **用途**：安全地将数据对象序列化为格式化 JSON 字符串，异常时返回 `"[Unserializable Object]"`。
- **签名**：`formatJson(data: unknown): string`
- **使用示例**：
  ```tsx
  import { formatJson } from "@/components/lib/format";
  const jsonString = formatJson(data);
  ```

#### Button 组件

- **文件**：[components/button.tsx](components/button.tsx)
- **用途**：通用按钮组件，支持多种样式变体和大小，包含加载状态
- **Props**：
  - `variant?: ButtonVariant` — 按钮样式变体（如 "primary", "destructive", "outline" 等），默认 "primary"
  - `size?: ButtonSize` — 按钮大小（如 "sm", "md", "lg"），默认 "md"
  - `loading?: boolean` — 是否显示加载状态
  - `loadingText?: string` — 加载时显示的文本
  - `disabled?: boolean` — 是否禁用按钮
  - 其他原生 button 属性
- **使用示例**：
  ```tsx
  <Button variant="primary" size="md">保存</Button>
  <Button variant="destructive" size="sm">删除</Button>
  <Button loading loadingText="加载中...">提交</Button>
  ```

#### IconButton 组件

- **文件**：[components/icon-button.tsx](components/icon-button.tsx)
- **用途**：图标按钮组件，用于展示仅包含图标的小按钮
- **Props**：
  - `color?: ButtonColor` — 按钮颜色（如 "primary", "destructive", "default"），默认 "default"
  - `shape?: IconButtonShape` — 按钮形状（如 "round", "square"），默认 "round"
  - 其他原生 button 属性
- **使用示例**：
  ```tsx
  <IconButton color="primary" shape="round">
    <Edit2 size={14} />
  </IconButton>
  <IconButton color="destructive" shape="square">
    <Trash2 size={16} />
  </IconButton>
  ```

#### TextInput 组件

- **文件**：[components/text-input.tsx](components/text-input.tsx)
- **用途**：文本输入框组件，提供统一的样式和交互体验
- **Props**：
  - `className?: string` — 额外 CSS 类名
  - 其他原生 input 属性
- **使用示例**：
  ```tsx
  <TextInput placeholder="请输入内容..." />
  <TextInput value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
  ```
