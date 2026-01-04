# 使用官方 Bun 镜像作为基础镜像
FROM oven/bun:latest AS base

# --- 第一阶段：安装依赖 ---
FROM base AS deps
WORKDIR /app

# 复制依赖文件
COPY package.json bun.lock ./

# 安装依赖（使用 --frozen-lockfile 确保版本一致）
RUN bun install --frozen-lockfile

# 设置环境变量为生产环境
ENV NODE_ENV=production
# 设置数据库文件路径（默认存放在 /app/data 目录下，建议运行时挂载此目录以持久化数据）
ENV DB_FILE_NAME=/app/data/novel.db
ENV WORKFLOW_TARGET_WORLD=@codehz/workflow-bun-sqlite
ENV WORKFLOW_SQLITE_URL=/app/data/novel.db

# --- 第二阶段：构建应用 ---
FROM base AS builder
WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
# 复制所有源代码
COPY . .

# 执行构建
RUN bun run build

# --- 第三阶段：运行阶段 ---
FROM base AS runner
WORKDIR /app

# 设置生产环境环境变量
ENV NODE_ENV=production

# 复制运行所需的文件
# 注意：由于不使用 standalone 模式，我们需要复制 .next, node_modules, public 等目录
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/drizzle ./drizzle

# 创建数据持久化目录
RUN mkdir -p /app/data

# 暴露应用端口
EXPOSE 3000

# 启动应用
# 使用 bun run start，它会执行 package.json 中的 "bunx --bun next start"
CMD ["bun", "run", "start"]
