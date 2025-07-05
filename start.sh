#!/bin/sh
set -e

# 日志函数
log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# 创建日志目录
mkdir -p /app/logs

# 启动后端服务
log_info "正在启动后端服务..."
cd /app/backend

# 检查数据库文件
if [ ! -f "database.db" ]; then
    log_info "初始化数据库..."
    touch database.db
fi

# 启动 Node.js 服务
node server.js > /app/logs/backend.log 2>&1 &
BACKEND_PID=$!

# 等待后端服务启动
log_info "等待后端服务启动..."
sleep 5

# 检查后端服务状态
if kill -0 $BACKEND_PID 2>/dev/null; then
    log_info "后端服务启动成功 (PID: $BACKEND_PID)"
else
    log_error "后端服务启动失败"
    exit 1
fi

# 测试后端API
log_info "测试后端API连接..."
if curl -f http://localhost:3001/api/health 2>/dev/null; then
    log_info "后端API连接正常"
else
    log_error "后端API连接失败"
    exit 1
fi

# 启动 Nginx
log_info "正在启动前端服务..."
nginx -t && nginx -g "daemon off;" &
NGINX_PID=$!

# 等待 Nginx 启动
sleep 3

# 检查 Nginx 状态
if kill -0 $NGINX_PID 2>/dev/null; then
    log_info "前端服务启动成功 (PID: $NGINX_PID)"
else
    log_error "前端服务启动失败"
    exit 1
fi

# 保持服务运行
log_info "所有服务启动完成，系统正在运行..."
wait $NGINX_PID 