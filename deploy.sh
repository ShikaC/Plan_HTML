#!/bin/bash

# 学习计划应用部署脚本
echo "🚀 开始部署学习计划应用..."

# 获取公网IP
echo "📍 获取公网IP地址..."
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com/ || curl -s http://ifconfig.me || echo "无法获取公网IP")
echo "公网IP: $PUBLIC_IP"

# 检查端口是否被占用
check_port() {
    local port=$1
    if netstat -tulpn | grep -q ":$port "; then
        echo "⚠️  端口 $port 已被占用"
        return 1
    else
        echo "✅ 端口 $port 可用"
        return 0
    fi
}

# 启动后端服务器
start_backend() {
    echo "🔧 启动后端服务器..."
    cd backend
    if [ ! -d "node_modules" ]; then
        echo "📦 安装后端依赖..."
        npm install
    fi
    
    # 检查是否已经在运行
    if pgrep -f "node.*server.js" > /dev/null; then
        echo "✅ 后端服务器已在运行"
    else
        echo "🌟 启动新的后端服务器实例..."
        nohup node server.js > ../backend.log 2>&1 &
        sleep 2
        if pgrep -f "node.*server.js" > /dev/null; then
            echo "✅ 后端服务器启动成功 (端口 3001)"
        else
            echo "❌ 后端服务器启动失败，请检查 backend.log"
            cat ../backend.log
            return 1
        fi
    fi
    cd ..
}

# 启动前端服务器
start_frontend() {
    echo "🎨 启动前端服务器..."
    cd frontend
    
    # 检查端口8000是否被占用
    if netstat -tulpn | grep -q ":8000 "; then
        echo "⚠️  端口 8000 已被占用，尝试停止现有服务..."
        pkill -f "python.*http.server.*8000" || true
        sleep 1
    fi
    
    echo "🌟 启动前端HTTP服务器..."
    nohup python3 -m http.server 8000 --bind 0.0.0.0 > ../frontend.log 2>&1 &
    sleep 2
    
    if netstat -tulpn | grep -q ":8000 "; then
        echo "✅ 前端服务器启动成功 (端口 8000)"
    else
        echo "❌ 前端服务器启动失败，请检查 frontend.log"
        cat ../frontend.log
        return 1
    fi
    cd ..
}

# 配置防火墙
configure_firewall() {
    echo "🔥 配置防火墙规则..."
    
    # 检查是否有ufw
    if command -v ufw >/dev/null 2>&1; then
        echo "使用 ufw 配置防火墙..."
        sudo ufw allow 8000/tcp comment "学习计划前端"
        sudo ufw allow 3001/tcp comment "学习计划后端API"
        echo "✅ 防火墙规则已添加"
    elif command -v iptables >/dev/null 2>&1; then
        echo "使用 iptables 配置防火墙..."
        sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
        sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
        echo "✅ iptables 规则已添加"
    else
        echo "⚠️  未发现防火墙管理工具，请手动开放端口 8000 和 3001"
    fi
}

# 检查服务状态
check_services() {
    echo "🔍 检查服务状态..."
    
    # 检查后端
    if curl -s http://localhost:3001/ >/dev/null; then
        echo "✅ 后端API服务正常"
    else
        echo "❌ 后端API服务异常"
    fi
    
    # 检查前端
    if curl -s http://localhost:8000/ >/dev/null; then
        echo "✅ 前端Web服务正常"
    else
        echo "❌ 前端Web服务异常"
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "🎉 部署完成！"
    echo "===================="
    echo "📱 前端访问地址:"
    echo "   本地访问: http://localhost:8000"
    if [ "$PUBLIC_IP" != "无法获取公网IP" ]; then
        echo "   公网访问: http://$PUBLIC_IP:8000"
    fi
    echo ""
    echo "🔌 后端API地址:"
    echo "   本地访问: http://localhost:3001"
    if [ "$PUBLIC_IP" != "无法获取公网IP" ]; then
        echo "   公网访问: http://$PUBLIC_IP:3001"
    fi
    echo ""
    echo "📝 日志文件:"
    echo "   后端日志: backend.log"
    echo "   前端日志: frontend.log"
    echo ""
    echo "🛑 停止服务:"
    echo "   pkill -f 'node.*server.js'     # 停止后端"
    echo "   pkill -f 'python.*http.server' # 停止前端"
    echo "===================="
}

# 主执行流程
main() {
    start_backend
    if [ $? -ne 0 ]; then
        echo "❌ 后端启动失败，终止部署"
        exit 1
    fi
    
    start_frontend
    if [ $? -ne 0 ]; then
        echo "❌ 前端启动失败，终止部署"
        exit 1
    fi
    
    configure_firewall
    sleep 3
    check_services
    show_access_info
}

# 如果有参数 --stop，则停止所有服务
if [ "$1" = "--stop" ]; then
    echo "🛑 停止所有服务..."
    pkill -f "node.*server.js" && echo "✅ 后端服务已停止"
    pkill -f "python.*http.server" && echo "✅ 前端服务已停止"
    exit 0
fi

# 如果有参数 --status，则检查服务状态
if [ "$1" = "--status" ]; then
    check_services
    exit 0
fi

# 执行主程序
main 