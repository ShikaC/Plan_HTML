<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 认证按钮容器 -->
    <AuthHeader />
    
    <!-- 主要内容 -->
    <div class="container mx-auto p-4 sm:p-6 lg:p-8">
      <AppHeader />
      
      <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧列：任务和进度 -->
        <div class="lg:col-span-2 space-y-8">
          <!-- 当日任务区域 -->
          <TodayTasks />
          
          <!-- 任务总览区域 -->
          <AllTasks />
          
          <!-- 进度图表区域 -->
          <ProgressChart />
        </div>

        <!-- 右侧列：日历和状态 -->
        <aside class="space-y-6">
          <!-- 日历区域 -->
          <CalendarView />
          
          <!-- 状态说明 -->
          <CalendarLegend />
        </aside>
      </main>
    </div>

    <!-- 任务模态框 -->
    <TaskModal />
    
    <!-- 认证模态框 -->
    <AuthModal />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTaskStore } from '@/stores/task'

// 组件导入
import AuthHeader from '@/components/AuthHeader.vue'
import AppHeader from '@/components/AppHeader.vue'
import TodayTasks from '@/components/TodayTasks.vue'
import AllTasks from '@/components/AllTasks.vue'
import ProgressChart from '@/components/ProgressChart.vue'
import CalendarView from '@/components/CalendarView.vue'
import CalendarLegend from '@/components/CalendarLegend.vue'
import TaskModal from '@/components/TaskModal.vue'
import AuthModal from '@/components/AuthModal.vue'

// 状态管理
const authStore = useAuthStore()
const taskStore = useTaskStore()

// 初始化
onMounted(async () => {
  await authStore.initializeAuth()
  await taskStore.initializeTasks()
})
</script> 