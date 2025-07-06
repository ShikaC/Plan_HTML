# Vue3快速启动指南

## 环境要求
- Node.js 16+ 
- npm 或 yarn

## 启动步骤

### 1. 启动后端服务器
```bash
cd backend
node server.js
```
- 后端API服务器将在 http://localhost:3001 运行
- 提供用户认证和任务管理接口

### 2. 启动前端服务器
```bash
cd frontend
npm install  # 首次运行需要安装依赖
npm run dev
```
- 前端Vue3应用将在 http://localhost:3000 运行
- 支持热重载开发

### 3. 访问应用
在浏览器中打开：http://localhost:3000

## 功能测试

### 用户认证
1. 点击右上角"注册"按钮
2. 填写用户名和密码进行注册
3. 注册成功后自动切换到登录模式
4. 使用刚注册的账号登录

### 任务管理
1. 点击"添加任务"按钮
2. 填写任务名称和截止日期
3. 保存任务
4. 在任务列表中查看、编辑、删除任务
5. 点击复选框标记任务完成

### 日历功能
1. 在右侧日历中点击日期
2. 查看该日期的任务
3. 使用左右箭头切换月份
4. 观察有任务的日期显示状态点

### 进度图表
- 添加任务后自动显示进度环形图
- 完成任务后进度会实时更新
- 查看详细统计信息

## 开发命令

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构
```
frontend/
├── src/
│   ├── components/     # Vue组件
│   ├── stores/        # Pinia状态管理
│   ├── services/      # API服务
│   └── main.js        # 应用入口
├── package.json       # 依赖配置
└── vite.config.js     # 构建配置
```

## 技术栈
- Vue 3 + Composition API
- Pinia 状态管理
- Vite 构建工具
- Tailwind CSS 样式框架
- Axios HTTP客户端

## 问题排查

### 端口冲突
如果端口被占用，可以修改配置：
- 前端：在 `vite.config.js` 中修改 `server.port`
- 后端：在 `backend/server.js` 中修改 `PORT` 变量

### 依赖问题
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### API连接问题
- 确保后端服务器正常运行
- 检查Vite代理配置是否正确

## 部署说明

### 生产构建
```bash
npm run build
```
生成的 `dist` 目录可直接部署到静态文件服务器。

### Docker部署
可使用现有的Dockerfile进行容器化部署。

---

🎉 **恭喜！** Vue3版本的学习计划应用已成功运行！ 