<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">学习计划 - 调试模式</h1>
    
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- 基础组件测试 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-4">组件加载测试</h2>
        
        <!-- 测试AppHeader -->
        <div class="mb-4 p-4 border rounded">
          <h3 class="font-semibold mb-2">AppHeader组件:</h3>
          <AppHeader />
        </div>
        
        <!-- 测试AuthHeader -->
        <div class="mb-4 p-4 border rounded">
          <h3 class="font-semibold mb-2">AuthHeader组件:</h3>
          <AuthHeader />
        </div>
        
        <!-- 状态管理测试 -->
        <div class="mb-4 p-4 border rounded bg-gray-50">
          <h3 class="font-semibold mb-2">状态管理测试:</h3>
          <p>认证状态: {{ authStore.isLoggedIn ? '已登录' : '未登录' }}</p>
          <p>任务数量: {{ taskStore.totalTasksCount }}</p>
          <p>已完成任务: {{ taskStore.completedTasksCount }}</p>
        </div>
        
        <!-- 更多组件测试按钮 -->
        <div class="flex gap-4">
          <button 
            @click="showCalendar = !showCalendar"
            class="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {{ showCalendar ? '隐藏' : '显示' }} 日历组件
          </button>
          
          <button 
            @click="showTasks = !showTasks"
            class="bg-green-500 text-white px-4 py-2 rounded"
          >
            {{ showTasks ? '隐藏' : '显示' }} 任务组件
          </button>
        </div>
        
        <!-- 条件渲染测试组件 -->
        <div v-if="showCalendar" class="mt-4 p-4 border rounded">
          <h3 class="font-semibold mb-2">日历组件:</h3>
          <CalendarView />
        </div>
        
        <div v-if="showTasks" class="mt-4 p-4 border rounded">
          <h3 class="font-semibold mb-2">今日任务组件:</h3>
          <TodayTasks />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTaskStore } from '@/stores/task'

// 基础组件导入
import AppHeader from '@/components/AppHeader.vue'
import AuthHeader from '@/components/AuthHeader.vue'
import CalendarView from '@/components/CalendarView.vue'
import TodayTasks from '@/components/TodayTasks.vue'

// 响应式数据
const showCalendar = ref(false)
const showTasks = ref(false)

// 状态管理
const authStore = useAuthStore()
const taskStore = useTaskStore()

// 初始化
onMounted(async () => {
  console.log('开始初始化状态管理...')
  try {
    await authStore.initializeAuth()
    console.log('认证状态初始化完成')
    
    await taskStore.initializeTasks()
    console.log('任务状态初始化完成')
  } catch (error) {
    console.error('状态管理初始化失败:', error)
  }
})

console.log('调试版App组件加载完成')
</script> 