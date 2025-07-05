// 导入所需的模块
const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // .verbose() 提供了更详细的错误日志
const cors = require('cors');
const bcrypt = require('bcryptjs'); // 用于密码加密
const jwt = require('jsonwebtoken'); // 用于JWT操作
const path = require('path'); // <-- 引入 'path' 模块

// --- 新增配置 ---
const JWT_SECRET = 'your_super_secret_key_12345'; // 用于签署JWT的密钥，生产环境中应更复杂且保密

// --- 新增: JWT认证中间件 ---
const authenticateToken = (req, res, next) => {
  // 从请求头的 Authorization 字段获取token
  // 格式通常是 "Bearer TOKEN"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized: 没有提供token
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden: token无效或已过期
    }
    // 将解码后的用户信息（包含userId）附加到请求对象上
    req.user = user;
    next(); // 继续执行下一个中间件或路由处理器
  });
};

// --- 初始化 Express 应用 ---
const app = express();
const PORT = 3001; // 为后端API选择一个端口，避免与前端冲突

// --- 中间件 (Middleware) ---
app.use(cors()); // 允许所有来源的跨域请求，方便前后端联调
app.use(express.json()); // 解析请求体中的JSON数据，例如从前端POST过来的登录信息

// --- 数据库设置 ---
// 定义数据库文件的路径
// 使用 path.join(__dirname, 'database.db') 可以确保数据库文件总是在 backend 目录内创建
const dbPath = path.join(__dirname, 'database.db');

// 连接到SQLite数据库。如果文件不存在，sqlite3会自动创建它。
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('成功连接到SQLite数据库.');
    // 成功连接后，运行数据表创建逻辑
    createTables();
  }
});

// --- 创建数据表 ---
// 使用 db.serialize() 可以确保SQL语句按顺序执行
const createTables = () => {
  db.serialize(() => {
    // 创建 'users' 表
    // IF NOT EXISTS 确保了如果表已存在，不会重复创建而导致错误
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error("创建 'users' 表失败:", err.message);
      } else {
        console.log("'users' 表已成功创建或已存在.");
      }
    });

    // 创建 'tasks' 表
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
      if (err) {
        console.error("创建 'tasks' 表失败:", err.message);
      } else {
        console.log("'tasks' 表已成功创建或已存在.");
      }
    });
  });
};

// --- API 路由 (Endpoints) ---

// 用户注册接口
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  // 简单验证
  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码' });
  }

  // 使用 bcrypt 对密码进行哈希加密，第二个参数是"加盐"的轮次，越高越安全但越慢
  const password_hash = bcrypt.hashSync(password, 10);
  
  const sql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
  db.run(sql, [username, password_hash], function(err) {
    if (err) {
      // UNIQUE约束会导致用户名重复时出错
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: '用户名已存在' });
      }
      return res.status(500).json({ message: '服务器内部错误', error: err.message });
    }
    // this.lastID 是新插入行的ID
    res.status(201).json({ message: '注册成功', userId: this.lastID });
  });
});

// 用户登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: '服务器内部错误', error: err.message });
    }
    // 检查用户是否存在，以及密码是否匹配
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 密码正确，生成JWT令牌
    // 令牌中通常会包含用户的ID等非敏感信息
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h' // 令牌有效期1小时
    });
    
    res.status(200).json({ message: '登录成功', token: token });
  });
});

// --- 新增: 受保护的任务(Tasks)相关路由 ---
// 应用 authenticateToken 中间件到所有 /api/tasks 的路由上
// 这意味着下面的所有接口都需要有效的JWT才能访问

// 获取当前用户的所有任务
app.get('/api/tasks', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const sql = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY dueDate';
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: '获取任务失败', error: err.message });
    }
    res.json(rows);
  });
});

// 添加一个新任务
app.post('/api/tasks', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { name, dueDate } = req.body;
  
  if (!name || !dueDate) {
    return res.status(400).json({ message: '任务名称和截止日期不能为空' });
  }

  const sql = 'INSERT INTO tasks (user_id, name, dueDate, completed) VALUES (?, ?, ?, 0)';
  db.run(sql, [userId, name, dueDate], function(err) {
    if (err) {
      return res.status(500).json({ message: '创建任务失败', error: err.message });
    }
    res.status(201).json({ id: this.lastID, user_id: userId, name, dueDate, completed: false });
  });
});

// 更新一个任务 (名称, 日期, 或完成状态)
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;
  const { name, dueDate, completed } = req.body;

  // 构建SQL语句，只更新传入的字段
  let fields = [];
  let params = [];
  if (name !== undefined) {
    fields.push('name = ?');
    params.push(name);
  }
  if (dueDate !== undefined) {
    fields.push('dueDate = ?');
    params.push(dueDate);
  }
  if (completed !== undefined) {
    fields.push('completed = ?');
    params.push(completed);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: '没有提供要更新的字段' });
  }
  
  params.push(taskId, userId);
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ message: '更新任务失败', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '任务不存在或不属于您' });
    }
    res.status(200).json({ message: '任务更新成功' });
  });
});

// 删除一个任务
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;

  const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
  db.run(sql, [taskId, userId], function(err) {
    if (err) {
      return res.status(500).json({ message: '删除任务失败', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '任务不存在或不属于您' });
    }
    res.status(204).send(); // 204 No Content
  });
});

// 同步本地任务到服务器
app.post('/api/tasks/sync', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { tasks: localTasks } = req.body;

  if (!Array.isArray(localTasks) || localTasks.length === 0) {
    return res.status(400).json({ message: '无效的任务数据' });
  }

  const sql = 'INSERT INTO tasks (user_id, name, dueDate, completed) VALUES (?, ?, ?, ?)';
  
  // 使用事务确保所有任务要么全部成功，要么全部失败
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    localTasks.forEach(task => {
      db.run(sql, [userId, task.name, task.dueDate, task.completed]);
    });
    db.run('COMMIT', (err) => {
      if (err) {
        // 如果提交失败，数据库会自动回滚
        return res.status(500).json({ message: '同步任务失败', error: err.message });
      }
      res.status(200).json({ message: '同步成功' });
    });
  });
});

// --- 基本路由 ---
// 定义一个根路由，用于测试服务器是否正常运行
app.get('/', (req, res) => {
  res.send('学习计划后端API正在运行!');
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  // 检查数据库连接状态
  db.get('SELECT 1', (err, result) => {
    if (err) {
      return res.status(500).json({ 
        status: 'error', 
        message: '数据库连接失败',
        error: err.message 
      });
    }
    res.status(200).json({ 
      status: 'ok', 
      message: '服务正常运行',
      timestamp: new Date().toISOString(),
      version: '2.1'
    });
  });
});

// --- 启动服务器 ---
app.listen(PORT, () => {
  console.log(`后端服务器正在 http://localhost:${PORT} 上运行`);
}); 