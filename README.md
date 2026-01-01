# AI 小说生成器

一个基于大语言模型的智能长篇小说自动生成平台。采用自定义 AI 工作流架构，支持多个 AI 供应商集成，可灵活配置不同的 AI 模型组合。

## 项目目标

- 🤖 **智能生成**：利用大语言模型自动生成长篇小说
- 🔄 **灵活工作流**：从零开始实现自定义 AI 工作流引擎
- 🔌 **多模型支持**：支持连接多个 AI 供应商，在工作流中灵活配置不同模型
- 👤 **单用户优先**：初期专注单用户模式，为后续扩展奠定基础

## 技术栈

### 前端

- **Next.js 16** - React 框架，App Router 架构，服务端组件，Server Actions
- **TypeScript** - 类型安全的开发体验
- **Tailwind CSS** - 样式管理和处理
- **ESLint** - 代码质量检查

### 后端

- **Next.js API Routes** - 后端接口服务
- **Node.js** - JavaScript 运行时环境
- **Drizzle ORM** - 数据库 ORM 工具

### 数据库

- 关系型数据库支持（通过 Drizzle ORM）

### 开发工具

- **TypeScript** - 静态类型检查
- **ESLint** - 代码规范

## 快速开始

### 前置要求

- bun

### 安装与运行

```bash
# 安装依赖
bun install

# 运行开发服务器
bun run dev

# 构建生产版本
bun run build

# 运行生产版本
bun start
```

开发服务器启动后，访问 [http://localhost:3000](http://localhost:3000) 即可查看应用。

### 文件结构

```
ai-novel/
├── app/                    # Next.js 应用目录
├── src/
│   └── db/                # 数据库相关文件
│       ├── schema.ts       # 数据库 schema 定义
│       └── index.ts        # 数据库初始化
├── drizzle/               # Drizzle ORM 配置与迁移
├── public/                # 静态资源
├── next.config.ts         # Next.js 配置
├── drizzle.config.ts      # Drizzle ORM 配置
└── tsconfig.json          # TypeScript 配置
```

## 项目进展

- [ ] 核心 AI 工作流引擎设计与实现
- [ ] AI 供应商集成模块
- [ ] 数据库 schema 设计
- [ ] Web UI 界面开发
- [ ] 小说生成与管理功能

## License

MIT
