<template>
  <section class="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-700">当日任务</h2>
        <p class="text-sm text-gray-500 mt-1">{{ selectedDateInfo }}</p>
      </div>
      <button
        @click="taskStore.showTaskModal()"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i> 添加任务
      </button>
    </div>
    
    <div class="space-y-3 mt-6 min-h-[150px]">
      <TransitionGroup name="task" tag="div" class="space-y-3">
        <TaskItem
          v-for="task in todayTasks"
          :key="task.id"
          :task="task"
          :is-today-task="true"
          :is-highlighted="false"
        />
      </TransitionGroup>
      
      <!-- 空状态 -->
      <div v-if="todayTasks.length === 0" class="text-center py-12 text-gray-500">
        <i class="fas fa-calendar-plus text-4xl mb-4"></i>
        <p>{{ selectedDateInfo }}</p>
        <p class="text-sm">点击"添加任务"来创建新任务</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import TaskItem from './TaskItem.vue'

const taskStore = useTaskStore()

// 计算当日任务
const todayTasks = computed(() => {
  if (!taskStore.selectedDate) return []
  return taskStore.tasks.filter(task => task.dueDate === taskStore.selectedDate)
})

// 选中日期信息
const selectedDateInfo = computed(() => {
  if (!taskStore.selectedDate) {
    return '点击日历选择日期查看当天任务'
  }
  const date = new Date(taskStore.selectedDate)
  return `${date.getMonth() + 1}月${date.getDate()}日的任务`
})
</script> 