# 智能学习计划管理系统 - 优化版 Docker 构建文件
# 多阶段构建，优化镜像大小和部署效率

# 第一阶段：构建后端依赖
FROM node:18-alpine AS backend-builder

# 设置工作目录
WORKDIR /app/backend

# 复制 package 文件
COPY backend/package*.json ./

# 安装生产依赖
RUN npm ci --only=production --no-audit --no-fund

# 复制后端源代码
COPY backend/ ./

# 创建数据目录
RUN mkdir -p /app/backend/data

# 第二阶段：构建最终镜像
FROM nginx:alpine

# 添加维护者信息
LABEL maintainer="Study Planner Team"
LABEL description="智能学习计划管理系统 - 全栈Web应用"
LABEL version="2.1"

# 安装必要的依赖
RUN apk add --no-cache \
    nodejs \
    npm \
    curl \
    && rm -rf /var/cache/apk/*

# 创建应用目录
RUN mkdir -p /app/backend /app/frontend /app/logs

# 从第一阶段复制后端文件
COPY --from=backend-builder /app/backend /app/backend

# 复制前端静态文件
COPY frontend/ /app/frontend/

# 复制配置文件和脚本
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /start.sh
COPY health_check.sh /health_check.sh

# 给脚本执行权限
RUN chmod +x /start.sh /health_check.sh

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001
ENV NODE_OPTIONS="--max-old-space-size=512"

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 设置文件权限
RUN chown -R nodejs:nodejs /app
RUN chown -R nodejs:nodejs /var/cache/nginx
RUN chown -R nodejs:nodejs /var/log/nginx

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD /health_check.sh

# 设置启动命令
CMD ["/start.sh"] 