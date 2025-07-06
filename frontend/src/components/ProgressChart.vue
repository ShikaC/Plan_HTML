<template>
  <section class="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50">
    <h2 class="text-2xl font-bold text-gray-700 mb-4">学习进度</h2>
    <div class="max-w-xs mx-auto">
      <div v-if="taskStore.totalTasksCount > 0" class="relative">
        <canvas ref="chartCanvas" width="300" height="300"></canvas>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="text-center">
            <div class="text-3xl font-bold text-gray-700">{{ taskStore.progressPercentage }}%</div>
            <div class="text-sm text-gray-500">完成进度</div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12 text-gray-500">
        <i class="fas fa-chart-pie text-4xl mb-4"></i>
        <p>还没有任务数据</p>
        <p class="text-sm">添加任务后查看进度</p>
      </div>
      
      <!-- 详细统计 -->
      <div v-if="taskStore.totalTasksCount > 0" class="mt-6 space-y-3">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span class="text-sm text-gray-600">已完成</span>
          </div>
          <span class="font-semibold text-gray-700">{{ taskStore.completedTasksCount }}</span>
        </div>
        
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span class="text-sm text-gray-600">进行中</span>
          </div>
          <span class="font-semibold text-gray-700">{{ taskStore.totalTasksCount - taskStore.completedTasksCount }}</span>
        </div>
        
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span class="text-sm text-gray-600">总计</span>
          </div>
          <span class="font-semibold text-gray-700">{{ taskStore.totalTasksCount }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useTaskStore } from '@/stores/task'

const taskStore = useTaskStore()
const chartCanvas = ref(null)
let chart = null

// 初始化图表
const initChart = async () => {
  if (!chartCanvas.value || taskStore.totalTasksCount === 0) return
  
  // 等待DOM更新
  await nextTick()
  
  const ctx = chartCanvas.value.getContext('2d')
  
  // 简单的圆环图实现
  const centerX = 150
  const centerY = 150
  const radius = 80
  const lineWidth = 20
  
  // 清空画布
  ctx.clearRect(0, 0, 300, 300)
  
  // 绘制背景圆环
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = '#e5e7eb'
  ctx.stroke()
  
  // 绘制进度圆环
  const progressAngle = (taskStore.progressPercentage / 100) * 2 * Math.PI
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progressAngle)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = '#22c55e'
  ctx.lineCap = 'round'
  ctx.stroke()
}

// 监听任务数据变化，更新图表
watch(
  () => [taskStore.completedTasksCount, taskStore.totalTasksCount],
  () => {
    initChart()
  },
  { deep: true }
)

// 组件挂载后初始化图表
onMounted(() => {
  initChart()
})
</script> 