# 🚀 快速开始 - 上传Docker镜像到Docker Hub

## 📁 您现在拥有的文件

1. **`dockerhub-upload-guide.md`** - 完整的详细教程
2. **`docker-upload.sh`** - 自动化上传脚本
3. **`QUICK_START.md`** - 本快速指南（您正在阅读）

## 🎯 两种上传方式

### 方式一：使用自动化脚本（推荐）

只需一个命令即可完成所有操作：

```bash
# 1. 给脚本执行权限
chmod +x docker-upload.sh

# 2. 运行脚本
./docker-upload.sh
```

脚本会自动：
- ✅ 检查Docker安装
- ✅ 引导您输入Docker Hub用户名
- ✅ 检查登录状态
- ✅ 构建镜像
- ✅ 推送到Docker Hub
- ✅ 验证上传结果

### 方式二：手动执行命令

如果您想手动控制每一步：

```bash
# 1. 登录Docker Hub
docker login

# 2. 构建镜像（将YOUR_USERNAME替换为您的用户名）
docker build -t YOUR_USERNAME/study-planner:latest .

# 3. 推送镜像
docker push YOUR_USERNAME/study-planner:latest
```

## 🔧 前置条件

确保您已经：
- [ ] 安装了Docker
- [ ] 注册了Docker Hub账户
- [ ] 在项目根目录中（包含Dockerfile的目录）

## 🆘 需要帮助？

- 查看 `dockerhub-upload-guide.md` 获取详细说明
- 查看您的Dockerfile（已优化，支持多阶段构建）
- 运行 `docker --version` 检查Docker是否安装

## 📝 示例输出

成功上传后，您将看到：

```
🎉 上传完成！

您的镜像已成功上传到Docker Hub：
  📦 镜像地址: docker.io/YOUR_USERNAME/study-planner
  🏷️  标签: latest, v2.1

其他人可以使用以下命令运行您的镜像：
  docker run -d -p 80:80 --name study-planner YOUR_USERNAME/study-planner:latest

Docker Hub页面: https://hub.docker.com/r/YOUR_USERNAME/study-planner
```

## 🎯 立即开始

选择您喜欢的方式：

```bash
# 简单方式 - 运行自动化脚本
./docker-upload.sh

# 或者手动方式 - 逐步执行
docker login
docker build -t YOUR_USERNAME/study-planner:latest .
docker push YOUR_USERNAME/study-planner:latest
```

**记住：**将 `YOUR_USERNAME` 替换为您的实际Docker Hub用户名！ 