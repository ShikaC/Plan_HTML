<template>
  <Transition name="modal">
    <div 
      v-if="authStore.isAuthModalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="handleBackdropClick"
    >
      <div 
        class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-transform duration-300"
        @click.stop
      >
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          {{ authStore.authModalMode === 'login' ? '登录' : '注册' }}
        </h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="username" class="block text-gray-700 text-sm font-bold mb-2">
              用户名
            </label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="w-full px-4 py-3 bg-gray-100 rounded-lg border-transparent focus:border-blue-500 focus:bg-white focus:ring-0"
              required
              placeholder="请输入用户名"
            />
          </div>
          
          <div class="mb-6">
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2">
              密码
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="w-full px-4 py-3 bg-gray-100 rounded-lg border-transparent focus:border-blue-500 focus:bg-white focus:ring-0"
              required
              placeholder="请输入密码"
            />
          </div>
          
          <!-- 错误消息 -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {{ errorMessage }}
          </div>
          
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="handleCancel"
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ authStore.isLoading ? '处理中...' : (authStore.authModalMode === 'login' ? '登录' : '注册') }}
            </button>
          </div>
        </form>
        
        <!-- 切换模式 -->
        <div class="mt-6 text-center">
          <button
            @click="switchMode"
            class="text-blue-500 hover:text-blue-600 text-sm"
          >
            {{ authStore.authModalMode === 'login' ? '没有账号？立即注册' : '已有账号？立即登录' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTaskStore } from '@/stores/task'

const authStore = useAuthStore()
const taskStore = useTaskStore()
const errorMessage = ref('')

const formData = reactive({
  username: '',
  password: ''
})

// 监听模态框显示状态，清空表单
watch(() => authStore.isAuthModalVisible, (visible) => {
  if (visible) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  formData.username = ''
  formData.password = ''
  errorMessage.value = ''
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formData.username.trim() || !formData.password.trim()) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  errorMessage.value = ''
  
  try {
    const credentials = {
      username: formData.username.trim(),
      password: formData.password.trim()
    }

    if (authStore.authModalMode === 'login') {
      // 登录
      const result = await authStore.login(credentials)
      if (result.success) {
        // 登录成功后同步本地任务并重新加载任务
        await taskStore.syncLocalTasks()
        await taskStore.initializeTasks()
        resetForm()
      } else {
        errorMessage.value = result.error || '登录失败'
      }
    } else {
      // 注册
      const result = await authStore.register(credentials)
      if (result.success) {
        // 注册成功，提示用户登录
        alert('注册成功！现在请登录。')
        authStore.authModalMode = 'login'
        resetForm()
      } else {
        errorMessage.value = result.error || '注册失败'
      }
    }
  } catch (error) {
    console.error('认证失败:', error)
    errorMessage.value = '操作失败，请重试'
  }
}

// 处理取消
const handleCancel = () => {
  authStore.hideAuthModal()
  resetForm()
}

// 处理背景点击
const handleBackdropClick = () => {
  handleCancel()
}

// 切换登录/注册模式
const switchMode = () => {
  authStore.authModalMode = authStore.authModalMode === 'login' ? 'register' : 'login'
  errorMessage.value = ''
}
</script> 