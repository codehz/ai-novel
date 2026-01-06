# 使用官方 Bun 镜像作为基础镜像
FROM oven/bun:alpine AS base

# 设置环境变量为生产环境
ENV NODE_ENV=production
ENV DB_FILE_NAME=/app/data/novel.db
ENV WORKFLOW_LOCAL_DATA_DIR=/app/data/workflow-data
ENV NEXT_TELEMETRY_DISABLED=1

# --- 第一阶段：安装依赖 ---
FROM base AS deps
WORKDIR /app

# 复制依赖文件
COPY package.json bun.lock ./

# 安装依赖（使用 --frozen-lockfile 确保版本一致）
RUN bun install --frozen-lockfile

# --- 第二阶段：构建应用 ---
FROM base AS builder
WORKDIR /app

RUN apk add --no-cache sqlite

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
# 复制所有源代码
COPY . .

# 执行构建
RUN mkdir -p /app/data && sqlite3 /app/data/novel.db 'PRAGMA journal_mode=WAL;' && bun run build

# --- 第三阶段：运行阶段 ---
FROM base AS runner
WORKDIR /app

# 设置生产环境环境变量
ENV NODE_ENV=production

# 复制运行所需的文件
COPY --from=builder /app/.next/standalone ./
# 复制 static 和 public（standalone 默认不包含，需要单独复制）
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 暴露应用端口
EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

VOLUME [ "/app/data" ]

# 启动应用
CMD ["bun", "run", "server.js"]
