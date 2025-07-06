import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)
  const isAuthModalVisible = ref(false)
  const authModalMode = ref('login') // 'login' | 'register'
  const isLoading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  // 初始化认证状态
  const initializeAuth = async () => {
    if (token.value) {
      try {
        // 尝试解析token获取用户信息
        const payload = JSON.parse(atob(token.value.split('.')[1]))
        user.value = { username: payload.username, userId: payload.userId }
        
        // 可选：验证token是否仍然有效
        // await apiService.verifyToken()
      } catch (error) {
        console.error('Token解析失败:', error)
        logout()
      }
    }
  }

  // 显示认证模态框
  const showAuthModal = (mode = 'login') => {
    authModalMode.value = mode
    isAuthModalVisible.value = true
  }

  // 隐藏认证模态框
  const hideAuthModal = () => {
    isAuthModalVisible.value = false
  }

  // 登录
  const login = async (credentials) => {
    try {
      isLoading.value = true
      const response = await apiService.login(credentials)
      
      token.value = response.token
      localStorage.setItem('token', response.token)
      
      // 解析用户信息
      const payload = JSON.parse(atob(response.token.split('.')[1]))
      user.value = { username: payload.username, userId: payload.userId }
      
      hideAuthModal()
      
      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (credentials) => {
    try {
      isLoading.value = true
      await apiService.register(credentials)
      
      return { success: true }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  // 获取认证头部
  const getAuthHeader = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return {
    // 状态
    token,
    user,
    isAuthModalVisible,
    authModalMode,
    isLoading,
    
    // 计算属性
    isLoggedIn,
    
    // 方法
    initializeAuth,
    showAuthModal,
    hideAuthModal,
    login,
    register,
    logout,
    getAuthHeader
  }
}) 