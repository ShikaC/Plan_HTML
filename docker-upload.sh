#!/bin/bash

# 🐳 Docker Hub 镜像上传脚本
# 智能学习计划管理系统

set -e  # 遇到错误就退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    print_success "Docker已安装: $(docker --version)"
}

# 获取用户输入
get_user_input() {
    # 获取Docker Hub用户名
    if [ -z "$DOCKER_USERNAME" ]; then
        read -p "请输入您的Docker Hub用户名: " DOCKER_USERNAME
    fi
    
    # 获取镜像名称
    if [ -z "$IMAGE_NAME" ]; then
        read -p "请输入镜像名称 (默认: study-planner): " IMAGE_NAME
        IMAGE_NAME=${IMAGE_NAME:-study-planner}
    fi
    
    # 获取版本标签
    if [ -z "$VERSION" ]; then
        read -p "请输入版本标签 (默认: v2.1): " VERSION
        VERSION=${VERSION:-v2.1}
    fi
    
    print_info "配置信息:"
    print_info "  用户名: $DOCKER_USERNAME"
    print_info "  镜像名: $IMAGE_NAME"
    print_info "  版本: $VERSION"
    
    read -p "确认以上信息正确吗? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "操作已取消"
        exit 1
    fi
}

# 检查是否已登录Docker Hub
check_docker_login() {
    print_info "检查Docker Hub登录状态..."
    if ! docker info | grep -q "Username"; then
        print_warning "未登录Docker Hub，请先登录"
        docker login
    else
        print_success "已登录Docker Hub"
    fi
}

# 构建Docker镜像
build_image() {
    print_info "开始构建Docker镜像..."
    
    # 检查Dockerfile是否存在
    if [ ! -f "Dockerfile" ]; then
        print_error "未找到Dockerfile文件"
        exit 1
    fi
    
    # 构建镜像
    docker build -t "$DOCKER_USERNAME/$IMAGE_NAME:latest" .
    docker build -t "$DOCKER_USERNAME/$IMAGE_NAME:$VERSION" .
    
    print_success "镜像构建完成"
}

# 推送镜像到Docker Hub
push_image() {
    print_info "开始推送镜像到Docker Hub..."
    
    # 推送latest标签
    print_info "推送 latest 标签..."
    docker push "$DOCKER_USERNAME/$IMAGE_NAME:latest"
    
    # 推送版本标签
    print_info "推送 $VERSION 标签..."
    docker push "$DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
    
    print_success "镜像推送完成"
}

# 验证镜像
verify_image() {
    print_info "验证镜像是否可用..."
    
    # 尝试拉取镜像
    docker pull "$DOCKER_USERNAME/$IMAGE_NAME:latest"
    
    print_success "镜像验证成功"
    
    # 显示镜像信息
    print_info "镜像信息:"
    docker images | grep "$DOCKER_USERNAME/$IMAGE_NAME"
}

# 显示使用说明
show_usage() {
    print_success "🎉 上传完成！"
    echo
    print_info "您的镜像已成功上传到Docker Hub："
    echo "  📦 镜像地址: docker.io/$DOCKER_USERNAME/$IMAGE_NAME"
    echo "  🏷️  标签: latest, $VERSION"
    echo
    print_info "其他人可以使用以下命令运行您的镜像："
    echo "  docker run -d -p 80:80 --name $IMAGE_NAME $DOCKER_USERNAME/$IMAGE_NAME:latest"
    echo
    print_info "Docker Hub页面: https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME"
}

# 清理函数
cleanup() {
    print_info "清理临时文件..."
    # 可以在这里添加清理代码
}

# 主函数
main() {
    echo "🐳 Docker Hub 镜像上传工具"
    echo "================================="
    echo
    
    # 检查前置条件
    check_docker
    
    # 获取用户输入
    get_user_input
    
    # 检查登录状态
    check_docker_login
    
    # 构建镜像
    build_image
    
    # 推送镜像
    push_image
    
    # 验证镜像
    verify_image
    
    # 显示使用说明
    show_usage
    
    print_success "所有操作完成！"
}

# 信号处理
trap cleanup EXIT

# 如果脚本被直接执行，则运行主函数
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 