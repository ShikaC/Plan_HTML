import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 使用Vite代理
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response
      
      if (status === 401 || status === 403) {
        // 认证失败，清除token
        localStorage.removeItem('token')
        window.location.reload()
      }
      
      throw new Error(data.message || `请求失败: ${status}`)
    } else if (error.request) {
      // 网络错误
      throw new Error('网络连接失败，请检查您的网络设置')
    } else {
      // 其他错误
      throw new Error(error.message || '请求失败')
    }
  }
)

// API服务对象
export const apiService = {
  // 认证相关
  async login(credentials) {
    const response = await api.post('/login', credentials)
    return response
  },

  async register(credentials) {
    const response = await api.post('/register', credentials)
    return response
  },

  async verifyToken() {
    const response = await api.get('/verify-token')
    return response
  },

  // 任务相关
  async getTasks() {
    const response = await api.get('/tasks')
    return response
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData)
    return response
  },

  async updateTask(taskId, updates) {
    const response = await api.put(`/tasks/${taskId}`, updates)
    return response
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`)
    return response
  },

  async syncTasks(tasks) {
    const response = await api.post('/tasks/sync', { tasks })
    return response
  },

  // 统计相关
  async getTaskStats() {
    const response = await api.get('/tasks/stats')
    return response
  },
}

// 导出axios实例，以便在其他地方使用
export default api 