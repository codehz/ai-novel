# Copilot 使用说明 — ai-novel

简短目标：帮助 AI 编码代理快速上手本仓库、理解架构边界、及提供可执行的开发与提交流程指令。

## 快速运行（必读） ✅

- 必需环境：bun
- 常用命令（在项目根目录）：

```bash
# 安装依赖
bun install

# 本地开发（需要设置 DB_FILE_NAME 环境变量）
bun run dev

# 构建生产
bun run build

# 运行生产
bun run start

# 代码风格检查
bun run lint
```

- 注意：`src/db/index.ts` 直接从 `Bun.env.DB_FILE_NAME` 读取数据库文件名，环境变量保存在.env中。

## 项目概览（大方向） 🔧

- 前端：基于 **Next.js App Router**（目录：`/app`），样式使用 **Tailwind**（`app/globals.css` + `postcss.config.mjs`）。
- 后端/数据层：Server-side 逻辑通过 Next.js server functions / API 路由（当前仓库尚未包含 API 路由实现）。
- 数据库：使用 **Drizzle ORM + sqlite (bun)**，初始化入口 `src/db/index.ts`，schema 文件 `src/db/schema.ts`，迁移与配置在 `drizzle/` 和 `drizzle.config.ts`（dialect: sqlite, schema -> `./src/db/schema.ts`）。

## 关键文件与定位 🔎

- UI / routes: `app/`（组件、页面、全局样式）
- DB 初始化 & schema: `src/db/index.ts`, `src/db/schema.ts`（注意：当前 schema 文件为空/占位）
- Drizzle 配置：`drizzle.config.ts`, 迁移目录 `drizzle/`
- Lint: `eslint.config.mjs`, 可用命令 `bun run lint`
- package.json 脚本：`dev`, `build`, `start`, `lint`
