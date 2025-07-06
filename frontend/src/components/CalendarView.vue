<template>
  <div class="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50">
    <div class="w-full">
      <div class="flex items-center justify-between mb-4">
        <button 
          @click="previousMonth"
          class="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <i class="fas fa-chevron-left text-gray-600"></i>
        </button>
        <h3 class="text-xl font-bold text-gray-700">{{ currentMonthYear }}</h3>
        <button 
          @click="nextMonth"
          class="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <i class="fas fa-chevron-right text-gray-600"></i>
        </button>
      </div>
      
      <!-- 星期标题 -->
      <div class="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 font-semibold mb-2">
        <div v-for="weekday in weekdays" :key="weekday">{{ weekday }}</div>
      </div>
      
      <!-- 日历网格 -->
      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="day in calendarDays"
          :key="day.key"
          :class="[
            'day-cell h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200 relative',
            {
              'text-gray-300': !day.isCurrentMonth,
              'text-gray-700': day.isCurrentMonth,
              'bg-blue-500 text-white': day.isToday,
              'selected-day': day.isSelected,
              'hover:bg-gray-100': day.isCurrentMonth && !day.isSelected && !day.isToday,
              'hover:bg-blue-600': day.isToday
            }
          ]"
          @click="selectDate(day)"
        >
          <span>{{ day.date }}</span>
          
          <!-- 任务状态点 -->
          <div
            v-if="day.taskStatus"
            :class="[
              'status-dot',
              day.taskStatus
            ]"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'

const taskStore = useTaskStore()

// 当前显示的年月
const currentDate = ref(new Date())

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 格式化月年显示
const currentMonthYear = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

// 生成日历数据
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // 获取本月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取本月第一天是星期几
  const startDayOfWeek = firstDay.getDay()
  
  // 获取本月天数
  const daysInMonth = lastDay.getDate()
  
  // 生成日历数组
  const days = []
  
  // 添加上个月的日期（填充前面的空位）
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate()
  
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i
    days.push({
      key: `prev-${date}`,
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      taskStatus: null,
      fullDate: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    })
  }
  
  // 添加本月的日期
  const today = new Date()
  const todayDateString = today.toISOString().split('T')[0]
  
  for (let date = 1; date <= daysInMonth; date++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    const isToday = fullDate === todayDateString
    const isSelected = fullDate === taskStore.selectedDate
    const taskStatus = taskStore.getDateTaskStatus(fullDate)
    
    days.push({
      key: `current-${date}`,
      date,
      isCurrentMonth: true,
      isToday,
      isSelected,
      taskStatus,
      fullDate
    })
  }
  
  // 添加下个月的日期（填充后面的空位，确保总共42个格子）
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  const remainingDays = 42 - days.length
  
  for (let date = 1; date <= remainingDays; date++) {
    days.push({
      key: `next-${date}`,
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      taskStatus: null,
      fullDate: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    })
  }
  
  return days
})

// 选择日期
const selectDate = (day) => {
  if (day.isCurrentMonth) {
    taskStore.setSelectedDate(day.fullDate)
  }
}

// 上一个月
const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

// 下一个月
const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

// 初始化
onMounted(() => {
  // 设置当前日期为默认显示月份
  const today = new Date()
  currentDate.value = today
})
</script> 