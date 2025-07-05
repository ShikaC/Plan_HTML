# 🐳 Docker Hub 镜像上传完整教程

## 📋 前置条件

### 1. 确保Docker已安装
```bash
docker --version
# 应该显示类似：Docker version 24.0.x, build xxx
```

### 2. 创建Docker Hub账户
- 访问 [Docker Hub](https://hub.docker.com/)
- 注册一个免费账户
- 记住您的用户名，后面会用到

## 🔑 步骤 1：登录Docker Hub

在终端中登录您的Docker Hub账户：

```bash
docker login
# 输入用户名和密码
```

## 🏗️ 步骤 2：构建Docker镜像

在项目根目录下构建您的镜像：

```bash
# 构建镜像，替换 YOUR_USERNAME 为您的Docker Hub用户名
docker build -t YOUR_USERNAME/study-planner:latest .

# 例如：如果您的用户名是 johnsmith
docker build -t johnsmith/study-planner:latest .
```

### 构建过程说明：
- `-t` 参数用于给镜像打标签
- `YOUR_USERNAME/study-planner:latest` 是镜像的完整名称
- `.` 表示使用当前目录的Dockerfile

## 🏷️ 步骤 3：为镜像打标签（可选）

如果您想创建多个版本的标签：

```bash
# 创建版本标签
docker tag YOUR_USERNAME/study-planner:latest YOUR_USERNAME/study-planner:v2.1
docker tag YOUR_USERNAME/study-planner:latest YOUR_USERNAME/study-planner:stable
```

## 📤 步骤 4：上传镜像到Docker Hub

```bash
# 推送latest版本
docker push YOUR_USERNAME/study-planner:latest

# 如果创建了其他标签，也可以推送
docker push YOUR_USERNAME/study-planner:v2.1
docker push YOUR_USERNAME/study-planner:stable
```

## ✅ 步骤 5：验证上传

1. 访问 Docker Hub 网站，登录您的账户
2. 在您的repositories中应该能看到 `study-planner` 镜像
3. 或者使用命令行验证：

```bash
# 删除本地镜像
docker rmi YOUR_USERNAME/study-planner:latest

# 从Docker Hub拉取镜像
docker pull YOUR_USERNAME/study-planner:latest

# 运行镜像测试
docker run -d -p 80:80 --name study-planner-test YOUR_USERNAME/study-planner:latest
```

## 📋 完整命令示例

假设您的Docker Hub用户名是 `johnsmith`，完整的命令序列：

```bash
# 1. 登录Docker Hub
docker login

# 2. 构建镜像
docker build -t johnsmith/study-planner:latest .

# 3. 创建版本标签
docker tag johnsmith/study-planner:latest johnsmith/study-planner:v2.1

# 4. 推送镜像
docker push johnsmith/study-planner:latest
docker push johnsmith/study-planner:v2.1

# 5. 验证（可选）
docker pull johnsmith/study-planner:latest
```

## 🚀 运行您的镜像

其他人可以使用以下命令运行您的镜像：

```bash
# 拉取并运行
docker run -d -p 80:80 --name study-planner YOUR_USERNAME/study-planner:latest

# 访问应用
curl http://localhost
# 或在浏览器中打开 http://localhost
```

## 📝 高级技巧

### 1. 自动化构建和推送

创建一个脚本来自动化这个过程：

```bash
#!/bin/bash
# build-and-push.sh

USERNAME="YOUR_USERNAME"
IMAGE_NAME="study-planner"
VERSION="v2.1"

echo "🏗️ 构建镜像..."
docker build -t $USERNAME/$IMAGE_NAME:latest .
docker build -t $USERNAME/$IMAGE_NAME:$VERSION .

echo "📤 推送镜像..."
docker push $USERNAME/$IMAGE_NAME:latest
docker push $USERNAME/$IMAGE_NAME:$VERSION

echo "✅ 完成！"
```

### 2. 镜像大小优化

您的Dockerfile已经使用了多阶段构建，这是很好的优化：

```dockerfile
# 多阶段构建减小镜像大小
FROM node:18-alpine AS backend-builder
# ... 构建阶段

FROM nginx:alpine
# ... 最终镜像
```

### 3. 持续集成/部署

您可以将这个过程集成到CI/CD管道中：

```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v1
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push
      uses: docker/build-push-action@v2
      with:
        context: .
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/study-planner:latest
```

## 🔧 常见问题解决

### 1. 权限问题
```bash
# 如果遇到权限问题，可以尝试
sudo docker login
sudo docker build -t YOUR_USERNAME/study-planner:latest .
```

### 2. 镜像太大
```bash
# 查看镜像大小
docker images

# 清理不需要的镜像
docker image prune -a
```

### 3. 推送失败
```bash
# 确保已登录
docker login

# 检查网络连接
ping hub.docker.com
```

---

## 📚 相关资源

- [Docker Hub官方文档](https://docs.docker.com/docker-hub/)
- [Dockerfile最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [Docker多阶段构建](https://docs.docker.com/develop/dev-best-practices/) 