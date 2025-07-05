#!/bin/bash

# 智能学习计划管理系统 - Docker 部署脚本
# 用于构建和推送 Docker 镜像

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
IMAGE_NAME="study-planner"
DOCKER_USERNAME="shika1201"
VERSION="2.1"

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装或未在PATH中"
        exit 1
    fi
    log_info "Docker 已安装: $(docker --version)"
}

# 构建镜像
build_image() {
    log_info "开始构建 Docker 镜像..."
    
    # 构建镜像
    docker build -t ${IMAGE_NAME}:${VERSION} .
    docker tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:latest
    
    if [ $? -eq 0 ]; then
        log_info "镜像构建成功!"
        log_info "镜像标签: ${IMAGE_NAME}:${VERSION} 和 ${IMAGE_NAME}:latest"
    else
        log_error "镜像构建失败"
        exit 1
    fi
}

# 测试镜像
test_image() {
    log_info "测试镜像运行..."
    
    # 停止可能存在的旧容器
    docker stop study-planner-test 2>/dev/null || true
    docker rm study-planner-test 2>/dev/null || true
    
    # 运行测试容器
    docker run -d -p 8080:80 --name study-planner-test ${IMAGE_NAME}:latest
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 测试健康检查
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        log_info "前端健康检查通过"
    else
        log_error "前端健康检查失败"
        docker logs study-planner-test
        exit 1
    fi
    
    # 测试后端API
    if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
        log_info "后端API健康检查通过"
    else
        log_error "后端API健康检查失败"
        docker logs study-planner-test
        exit 1
    fi
    
    log_info "所有测试通过!"
    
    # 清理测试容器
    docker stop study-planner-test
    docker rm study-planner-test
}

# 推送镜像
push_image() {
    log_info "推送镜像到 Docker Hub..."
    
    # 检查是否已登录
    if ! docker info | grep -q "Username:"; then
        log_warn "请先登录 Docker Hub:"
        docker login
    fi
    
    # 标记镜像
    docker tag ${IMAGE_NAME}:${VERSION} ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
    docker tag ${IMAGE_NAME}:latest ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
    
    # 推送镜像
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
    
    if [ $? -eq 0 ]; then
        log_info "镜像推送成功!"
        log_info "可以使用以下命令拉取镜像:"
        log_info "docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
        log_info "docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
    else
        log_error "镜像推送失败"
        exit 1
    fi
}

# 显示使用方法
show_usage() {
    echo "使用方法: $0 [选项]"
    echo "选项:"
    echo "  build    - 构建镜像"
    echo "  test     - 测试镜像"
    echo "  push     - 推送镜像"
    echo "  all      - 执行所有步骤 (构建、测试、推送)"
    echo "  clean    - 清理本地镜像"
    echo "  help     - 显示帮助"
}

# 清理镜像
clean_images() {
    log_info "清理本地镜像..."
    docker rmi ${IMAGE_NAME}:${VERSION} 2>/dev/null || true
    docker rmi ${IMAGE_NAME}:latest 2>/dev/null || true
    docker rmi ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} 2>/dev/null || true
    docker rmi ${DOCKER_USERNAME}/${IMAGE_NAME}:latest 2>/dev/null || true
    log_info "清理完成"
}

# 主函数
main() {
    case "${1:-all}" in
        build)
            check_docker
            build_image
            ;;
        test)
            check_docker
            test_image
            ;;
        push)
            check_docker
            push_image
            ;;
        all)
            check_docker
            build_image
            test_image
            push_image
            ;;
        clean)
            clean_images
            ;;
        help)
            show_usage
            ;;
        *)
            log_error "未知选项: $1"
            show_usage
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@" 