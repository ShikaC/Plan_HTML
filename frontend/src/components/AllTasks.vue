<template>
  <section class="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-700">任务总览</h2>
      <div class="flex gap-2">
        <button
          @click="taskStore.toggleShowCompleted()"
          class="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
        >
          <i class="fas fa-eye"></i> 
          {{ taskStore.showCompletedTasks ? '隐藏已完成' : '显示已完成' }}
        </button>
      </div>
    </div>
    
    <div class="space-y-3 mt-6 min-h-[200px]">
      <!-- 任务列表 -->
      <TransitionGroup name="task" tag="div" class="space-y-3">
        <TaskItem
          v-for="task in visibleTasks"
          :key="task.id"
          :task="task"
          :is-today-task="false"
          :is-highlighted="isTaskHighlighted(task)"
          :is-filtered="isTaskFiltered(task)"
        />
      </TransitionGroup>
      
      <!-- 空状态 -->
      <div v-if="visibleTasks.length === 0" class="text-center py-12 text-gray-500">
        <i class="fas fa-inbox text-4xl mb-4"></i>
        <p v-if="taskStore.tasks.length === 0">还没有任务</p>
        <p v-else-if="!taskStore.showCompletedTasks">所有任务都已完成！</p>
        <p v-else>没有找到任务</p>
        <button
          @click="taskStore.showTaskModal()"
          class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <i class="fas fa-plus mr-2"></i>添加第一个任务
        </button>
      </div>
      
      <!-- 统计信息 -->
      <div v-if="taskStore.tasks.length > 0" class="mt-6 pt-4 border-t border-gray-200">
        <div class="flex justify-between text-sm text-gray-600">
          <span>总任务数：{{ taskStore.totalTasksCount }}</span>
          <span>已完成：{{ taskStore.completedTasksCount }}</span>
          <span>进度：{{ taskStore.progressPercentage }}%</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import TaskItem from './TaskItem.vue'

const taskStore = useTaskStore()

// 可见任务
const visibleTasks = computed(() => {
  return taskStore.visibleTasks
})

// 判断任务是否高亮显示
const isTaskHighlighted = (task) => {
  // 如果有选中日期，高亮显示该日期的任务
  if (taskStore.selectedDate) {
    return task.dueDate === taskStore.selectedDate
  }
  return false
}

// 判断任务是否被过滤（降低透明度）
const isTaskFiltered = (task) => {
  // 如果有选中日期，非该日期的任务显示为过滤状态
  if (taskStore.selectedDate) {
    return task.dueDate !== taskStore.selectedDate
  }
  return false
}
</script> 