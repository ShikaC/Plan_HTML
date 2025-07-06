<template>
  <div 
    class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
    :class="{ 
      'task-item-filtered': isFiltered,
      'task-item-highlight': isHighlighted,
      'opacity-60': task.completed
    }"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3 flex-1">
        <!-- 完成状态复选框 -->
        <input
          type="checkbox"
          :checked="task.completed"
          @change="handleToggleComplete"
          class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
        />
        
        <!-- 任务信息 -->
        <div class="flex-1">
          <h3 
            class="font-semibold text-gray-800 mb-1"
            :class="{ 'line-through text-gray-500': task.completed }"
          >
            {{ task.name }}
          </h3>
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <i class="fas fa-calendar-alt"></i>
              {{ formatDate(task.dueDate) }}
            </span>
            <span 
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="statusClass"
            >
              {{ statusText }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex items-center gap-2">
        <button
          @click="handleEdit"
          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="编辑任务"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button
          @click="handleDelete"
          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="删除任务"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  isTodayTask: {
    type: Boolean,
    default: false
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  isFiltered: {
    type: Boolean,
    default: false
  }
})

const taskStore = useTaskStore()

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 任务状态样式
const statusClass = computed(() => {
  if (props.task.completed) {
    return 'bg-green-100 text-green-800'
  }
  
  const today = new Date()
  const dueDate = new Date(props.task.dueDate)
  
  if (dueDate < today) {
    return 'bg-red-100 text-red-800'
  } else if (dueDate.toDateString() === today.toDateString()) {
    return 'bg-blue-100 text-blue-800'
  } else {
    return 'bg-gray-100 text-gray-800'
  }
})

// 任务状态文本
const statusText = computed(() => {
  if (props.task.completed) {
    return '已完成'
  }
  
  const today = new Date()
  const dueDate = new Date(props.task.dueDate)
  
  if (dueDate < today) {
    return '已过期'
  } else if (dueDate.toDateString() === today.toDateString()) {
    return '今天到期'
  } else {
    return '进行中'
  }
})

// 处理完成状态切换
const handleToggleComplete = () => {
  taskStore.toggleTask(props.task.id, !props.task.completed)
}

// 处理编辑
const handleEdit = () => {
  taskStore.showTaskModal(props.task)
}

// 处理删除
const handleDelete = () => {
  if (confirm('确定要删除这个任务吗？')) {
    taskStore.deleteTask(props.task.id)
  }
}
</script> 