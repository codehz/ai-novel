# Copilot 使用说明 — ai-novel

目的：让 AI 编码代理能即刻理解架构、数据流与开发手感，减少踩坑时间。

## 快速运行

- 必需：bun；所有命令在仓库根目录执行。
- 常用脚本：`bun install`，`bun run dev`，`bun run build`，`bun run start`，`bun run lint`，`bun run format[:check]`（见 [package.json](package.json)）。
- 数据库文件名从 `.env` 文件中的 `DB_FILE_NAME` 环境变量读取，bun 会自动加载 `.env` 文件；未设置会在 [src/db/index.ts](src/db/index.ts) 处直接抛错。
- Drizzle 迁移在应用启动时自动执行：`migrate(db, { migrationsFolder: "./drizzle" })`，避免在只读/无共享文件系统环境中误触。

## 架构与数据流

- Next.js App Router，根布局在 [app/layout.tsx](app/layout.tsx)，提供顶部导航/页脚。
- 首页为静态展示页 [app/page.tsx](app/page.tsx)，引导到模型管理与写作入口。
- 模型管理页 [app/models/page.tsx](app/models/page.tsx) 是 Server Component：服务端读取提供商+模型列表后传给客户端列表组件。
- 调用日志页 [app/logs/page.tsx](app/logs/page.tsx) 是 Server Component：显示模型调用历史、成本统计和配置快照。
- Server Actions集中在 [src/actions/models.ts](src/actions/models.ts)：CRUD provider/model/call logs，全程走 Drizzle，并在变更后 `revalidatePath("/models")` 保证 UI 刷新。
- 数据库：bun-sqlite + Drizzle（schema [src/db/schema.ts](src/db/schema.ts)）。`model_providers` 与 `models` 通过 `providerId` 级联删除；`provider_type` 唯一。
- DB 初始化 [src/db/index.ts](src/db/index.ts)：用 `Bun.env.DB_FILE_NAME` 打开 sqlite，导出 `db` 并立即迁移。
- AI 模型注册表：`AIRegistry` ([src/lib/ai-registry.ts](src/lib/ai-registry.ts)) 单例类，提供懒加载的模型客户端缓存，根据配置动态创建包装后的模型实例。
- AI 中间件：自定义 `wrapLanguageModelWithLogging` ([src/lib/ai-middleware.ts](src/lib/ai-middleware.ts))，自动记录调用日志、计算成本并注入默认参数。
- 提供商工厂：`createProviderClient` ([src/lib/provider-factory.ts](src/lib/provider-factory.ts))，根据提供商类型创建 AI SDK 客户端，目前支持 OpenAI 兼容提供商。
- AI 工作流引擎：支持自定义 AI 工作流，集成多个 AI 供应商，灵活配置不同模型组合。
- 工具箱：提供辅助创作工具，如种子想法扩展等。

## 前端约定与模式

- 页面数据读取：Server Component 负责查询（如 `getProviders()`），UI 交互在 `"use client"` 组件内完成（[app/models/components/provider-list.tsx](app/models/components/provider-list.tsx)、[app/models/components/model-list.tsx](app/models/components/model-list.tsx)）。
- 表单：`ProviderForm`/`ModelForm` 直接调用对应 server action；插入/更新都用 `upsert*`，更新时附带 `updatedAt: new Date()`，保持与 sqlite 时间戳列一致。
- 状态切换/删除：UI 做 `confirm` 弹窗，action 侧只做 Drizzle 更新/删除并刷新路径。
- 价格字段为 `real`（浮点），参数字段为 JSON（`parameters`）；客户端默认 `parameters: {}` 避免 `null`。
- 提供商配置：`config` 字段存储 JSON 配置（如 API 版本、自定义端点等）；模型参数拆分为结构化字段（temperature、maxTokens、topP）+ 其他参数 JSON。
- 主题：使用纯 CSS 变量控制主题，Tailwind v4 样式变量集中在 [app/globals.css](app/globals.css)。(Note: tailwind v4 is already released)
- 组件复用：使用通用组件如 `ItemCard` 和 `AddCard` 统一 UI 模式。

## 数据库结构

- `model_providers` 表：存储模型提供商信息（类型、名称、API密钥、端点等）
  - `config` JSON字段：存储提供商特定配置（如OpenAI兼容的apiVersion、自定义endpoint）
- `models` 表：存储具体模型信息（名称、参数、价格等），与提供商关联
  - `parameters` JSON字段：存储模型参数配置（temperature、maxTokens、topP等）
- `model_call_logs` 表：记录模型调用日志（输入输出、成本、状态等），支持统计分析
  - `duration_ms` 字段：记录调用耗时
  - `model_config_snapshot` JSON字段：保存调用时的完整配置快照用于审计
- 使用 SQLite 的 unixepoch() 函数处理时间戳
- 价格字段使用 `real` 类型存储每百万token的价格
- 参数字段使用 JSON 类型存储模型参数配置

## AI 工作流与调用日志

- 模型调用日志：`modelCallLogs` 表记录所有模型调用详情，包括输入输出、token数量、成本等
- 统计功能：提供 `getCallStatistics` 函数计算调用统计信息（总token数、总成本、成功率等）
- 成本追踪：自动计算模型调用的输入/输出成本
- 调用状态：记录调用状态（pending、success、error）
- AI 模型注册表：`AIRegistry` 单例类提供懒加载的模型客户端缓存，自动刷新配置变更
- 日志中间件：`wrapLanguageModelWithLogging` 自动记录调用日志、计算成本并注入默认参数
- 提供商工厂：`createProviderClient` 根据提供商类型创建 AI SDK 客户端，支持 OpenAI 兼容提供商

## 工具箱功能

- 工具页面：[app/tools/page.tsx](app/tools/page.tsx) 提供工具列表入口
- 种子想法扩展：[app/tools/seed-expander](app/tools/seed-expander) 工具，可将简短想法扩展为多个情节方向
- 工具组件：位于 [app/tools/components](app/tools/components) 目录，可扩展更多创作辅助工具

## 开发提示

- Drizzle 配置在 [drizzle.config.ts](drizzle.config.ts)，迁移目录 [drizzle/](drizzle)。需要手工调整 schema 时同步迁移。
- 统一通过 server actions 访问数据库，保持缓存刷新语义；新增路由时复用此模式。
- icon 使用 lucide-react；UI 使用简洁容器 + 阴影样式，保持现有视觉语言。
- 模型调用时注意记录日志，便于后续成本分析和调试。
- 新增工具时遵循工具箱组件结构，保持一致的UI/UX。
- AI 模型使用：通过 `aiRegistry.getModel(providerId, modelId)` 获取包装后的模型实例，自动应用日志和缓存。
- 调用日志追踪：在 `providerOptions` 中传入 `logging: { callReason: <reason> }` 参数用于日志分类（如 `"/tools/seed-expander"`）。
- 提供商扩展：新增提供商类型时，在 `provider-factory.ts` 中添加对应的创建逻辑。
- 缓存管理：模型配置变更后自动失效缓存，无需手动处理。
