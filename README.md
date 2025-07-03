# 学习计划应用 (Study Planner)

这是一个使用现代前端技术构建的简单、美观且功能齐全的学习计划管理应用。用户可以添加、编辑、删除学习任务，并通过日历和图表直观地查看自己的学习安排与进度。

## ✨ 主要功能

- **任务管理**: 添加、编辑、删除和标记完成学习任务。
- **数据持久化**: 所有任务数据通过 `localStorage` 保存在用户本地浏览器中，刷新不丢失。
- **日历视图**: 动态生成的月度日历，高亮显示有任务的日期。
- **进度可视化**: 使用 Chart.js 绘制一个优雅的甜甜圈图，展示任务完成比例。
- **响应式设计**: 界面在桌面和移动设备上均有良好的视觉和使用体验。
- **容器化部署**: 提供了 `Dockerfile`，可以轻松打包成 Docker 镜像进行分发和部署。

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **CSS框架**: [Tailwind CSS v3](https://tailwindcss.com/)
- **图标库**: [Font Awesome v6](https://fontawesome.com/)
- **图表库**: [Chart.js v4](https://www.chartjs.org/)
- **Web服务器 (部署)**: [Nginx](https://www.nginx.com/)

## 🚀 如何运行

您可以通过两种方式来运行这个项目：本地直接运行或使用 Docker。

### 1. 本地运行 (无需 Docker)

由于这是一个纯静态网站，您只需要一个简单的本地 Web 服务器即可运行。

1.  确保您的电脑上安装了 Python 3。
2.  将项目克隆或下载到本地。
3.  在项目根目录下打开终端，运行以下命令：
    ```bash
    python3 -m http.server 8000
    ```
4.  在浏览器中打开 `http://localhost:8000` 即可访问。

### 2. 使用 Docker 运行

这是推荐的部署和分发方式。

1.  **构建 Docker 镜像**:
    在项目根目录下，运行以下命令来构建镜像。这里我们将镜像命名为 `study-planner`。
    ```bash
    docker build -t study-planner .
    ```

2.  **运行 Docker 容器**:
    使用上一步构建的镜像来启动一个容器。
    ```bash
    # 这会将本地的 8080 端口映射到容器的 80 端口
    docker run -d -p 8080:80 --name my-study-app study-planner
    ```

3.  **访问应用**:
    在浏览器中打开 `http://localhost:8080`。

### 3. 从 Docker Hub 运行 (已上传)
该项目镜像已上传至 Docker Hub，您也可以直接拉取并运行。
```bash
# 拉取镜像
docker pull shika1201/study-planner:1.0

# 运行容器
docker run -d -p 8080:80 shika1201/study-planner:1.0
```
然后在浏览器中访问 `http://localhost:8080`。