# 学习计划应用 (Study Planner)

这是一个功能完整的全栈学习计划管理应用，支持用户认证、任务管理、数据同步等功能。用户可以添加、编辑、删除学习任务，并通过日历和图表直观地查看自己的学习安排与进度。

## 🌐 在线演示

**🚀 公网访问地址**: [http://YOUR_SERVER_IP:8000](http://YOUR_SERVER_IP:8000)

部署完成后，您可以直接在浏览器中访问完整的应用！

## ✨ 主要功能

- **用户系统**: 用户注册、登录、JWT认证保护
- **任务管理**: 添加、编辑、删除和标记完成学习任务
- **数据同步**: 支持本地存储与云端数据库的双向同步
- **日历视图**: 动态生成的月度日历，高亮显示有任务的日期
- **进度可视化**: 使用 Chart.js 绘制优雅的甜甜圈图，展示任务完成比例
- **响应式设计**: 界面在桌面和移动设备上均有良好的视觉和使用体验
- **自动部署**: 提供一键部署脚本，支持公网访问

## 🛠️ 技术栈

### 前端
- **前端框架**: HTML5, CSS3, JavaScript (ES6+)
- **CSS框架**: [Tailwind CSS v3](https://tailwindcss.com/)
- **图标库**: [Font Awesome v6](https://fontawesome.com/)
- **图表库**: [Chart.js v4](https://www.chartjs.org/)
- **Web服务器**: Python HTTP Server

### 后端
- **运行环境**: Node.js
- **Web框架**: Express.js
- **数据库**: SQLite3
- **认证**: JWT (JSON Web Tokens)
- **密码加密**: bcryptjs
- **跨域支持**: CORS

### 部署
- **操作系统**: Linux (Ubuntu)
- **防火墙**: iptables
- **进程管理**: 后台进程 (nohup)
- **容器化**: Docker (可选)

## 🚀 快速开始

### 🌟 一键部署 (推荐)

如果您有一台Linux服务器，可以使用提供的部署脚本一键启动：

```bash
# 1. 克隆项目
git clone <repository-url>
cd study-planner

# 2. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

部署脚本会自动：
- ✅ 安装后端依赖
- ✅ 启动前端服务器 (端口 8000)
- ✅ 启动后端API服务器 (端口 3001)
- ✅ 配置防火墙规则
- ✅ 获取公网IP并显示访问地址

### 📋 部署管理命令

```bash
# 检查服务状态
./deploy.sh --status

# 重新启动所有服务
./deploy.sh

# 停止所有服务
./deploy.sh --stop
```

### 🖥️ 本地开发

#### 启动后端服务
```bash
cd backend
npm install
node server.js
```
后端API将在 `http://localhost:3001` 运行

#### 启动前端服务
```bash
cd frontend
python3 -m http.server 8000
```
前端应用将在 `http://localhost:8000` 运行

### 🐳 使用 Docker 部署

#### 从源码构建
```bash
# 构建镜像
docker build -t study-planner .

# 运行容器
docker run -d -p 8080:80 --name study-planner study-planner
```

#### 从 Docker Hub 拉取
```bash
# 拉取官方镜像
docker pull shika1201/study-planner:1.0

# 运行容器
docker run -d -p 8080:80 shika1201/study-planner:1.0
```

## 📊 项目结构

```
study-planner/
├── frontend/                 # 前端静态文件
│   ├── index.html           # 主页面
│   ├── script.js            # 主要逻辑
│   ├── style.css            # 自定义样式
│   └── test.html            # 测试页面
├── backend/                  # 后端服务
│   ├── server.js            # Express服务器
│   ├── package.json         # 依赖配置
│   ├── database.db          # SQLite数据库
│   └── node_modules/        # 依赖包
├── deploy.sh                # 一键部署脚本
├── Dockerfile               # Docker构建文件
├── README.md                # 项目说明
└── 部署状态.md              # 部署状态跟踪
```

## 🔧 配置说明

### 网络端口
- **前端Web服务**: 8000端口
- **后端API服务**: 3001端口

### 数据库
- **类型**: SQLite3
- **位置**: `backend/database.db`
- **表结构**: 
  - `users` - 用户信息表
  - `tasks` - 任务数据表

### API端点
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建新任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `POST /api/tasks/sync` - 同步本地任务

## 🔍 功能特性

### 🔐 用户认证
- 安全的用户注册和登录系统
- JWT token认证保护API
- 密码BCrypt加密存储

### 📝 任务管理
- 直观的任务增删改查界面
- 任务完成状态切换
- 按日期排序显示

### 💾 数据同步
- 未登录时使用本地存储
- 登录后自动同步本地数据到云端
- 支持多设备数据同步

### 📅 日历集成
- 月度日历视图
- 任务日期高亮显示
- 点击日期查看当日任务

### 📈 进度统计
- 实时任务完成进度图表
- 视觉化的甜甜圈图表
- 完成率统计

## 🛡️ 安全特性

- ✅ JWT认证保护API接口
- ✅ 密码BCrypt哈希加密
- ✅ CORS跨域请求控制
- ✅ 防火墙端口访问控制
- ✅ SQL注入防护

## 📝 日志管理

应用运行时会生成以下日志文件：
- `backend.log` - 后端服务日志
- `frontend.log` - 前端服务日志

查看实时日志：
```bash
# 查看后端日志
tail -f backend.log

# 查看前端日志
tail -f frontend.log
```

## 🔄 更新部署

当您修改代码后，重新部署：

```bash
# 停止现有服务
./deploy.sh --stop

# 重新启动服务
./deploy.sh
```

## 📞 技术支持

如果您在部署或使用过程中遇到问题：

1. 检查服务状态：`./deploy.sh --status`
2. 查看日志文件：`tail -f backend.log`
3. 确认端口开放：`netstat -tulpn | grep -E ":(8000|3001)"`
4. 检查防火墙设置

## 📄 许可证

本项目采用开源许可证，您可以自由使用、修改和分发。

---

## 🎉 立即体验

**🌐 在线访问**: [http://YOUR_SERVER_IP:8000](http://YOUR_SERVER_IP:8000)

部署完成后，使用部署脚本显示的公网IP地址访问您的应用，开始高效学习计划管理之旅！✨