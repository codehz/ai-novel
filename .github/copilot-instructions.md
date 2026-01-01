# Copilot 使用说明 — ai-novel

目的：让 AI 编码代理能即刻理解架构、数据流与开发手感，减少踩坑时间。

## 快速运行

- 必需：bun；所有命令在仓库根目录执行。
- 常用脚本：`bun install`，`bun run dev`（需 DB_FILE_NAME），`bun run build`，`bun run start`，`bun run lint`，`bun run format[:check]`（见 [package.json](package.json)）。
- 数据库文件名从环境变量 `DB_FILE_NAME` 读取；未设置会在 [src/db/index.ts](src/db/index.ts) 处直接抛错。（已经在.env中定义）
- Drizzle 迁移在应用启动时自动执行：`migrate(db, { migrationsFolder: "./drizzle" })`，避免在只读/无共享文件系统环境中误触。

## 架构与数据流

- Next.js App Router，根布局在 [app/layout.tsx](app/layout.tsx)，使用 `next-themes` 包裹全局并提供顶部导航/页脚。
- 首页为静态展示页 [app/page.tsx](app/page.tsx)，引导到模型管理与写作入口。
- 模型管理页 [app/models/page.tsx](app/models/page.tsx) 是 Server Component：服务端读取提供商+模型列表后传给客户端列表组件。
- Server Actions集中在 [src/actions/models.ts](src/actions/models.ts)：CRUD provider/model，全程走 Drizzle，并在变更后 `revalidatePath("/models")` 保证 UI 刷新。
- 数据库：bun-sqlite + Drizzle（schema [src/db/schema.ts](src/db/schema.ts)）。`model_providers` 与 `models` 通过 `providerId` 级联删除；`provider_type` 唯一。
- DB 初始化 [src/db/index.ts](src/db/index.ts)：用 `Bun.env.DB_FILE_NAME` 打开 sqlite，导出 `db` 并立即迁移。

## 前端约定与模式

- 页面数据读取：Server Component 负责查询（如 `getProviders()`），UI 交互在 `"use client"` 组件内完成（[app/models/components/provider-list.tsx](app/models/components/provider-list.tsx)、[app/models/components/model-list.tsx](app/models/components/model-list.tsx)）。
- 表单：`ProviderForm`/`ModelForm` 直接调用对应 server action；插入/更新都用 `upsert*`，更新时附带 `updatedAt: new Date()`，保持与 sqlite 时间戳列一致。
- 状态切换/删除：UI 做 `confirm` 弹窗，action 侧只做 Drizzle 更新/删除并刷新路径。
- 价格字段为 `real`（浮点），参数字段为 JSON（`parameters`）；客户端默认 `parameters: {}` 避免 `null`。
- 主题：`ThemeToggle` 用 `next-themes`，首屏有挂载防闪烁逻辑；Tailwind v4 样式变量集中在 [app/globals.css](app/globals.css)。

## 开发提示

- Drizzle 配置在 [drizzle.config.ts](drizzle.config.ts)，迁移目录 [drizzle/](drizzle)。需要手工调整 schema 时同步迁移。
- 统一通过 server actions 访问数据库，保持缓存刷新语义；新增路由时复用此模式。
- icon 使用 lucide-react；UI 使用简洁容器 + 阴影样式，保持现有视觉语言。
