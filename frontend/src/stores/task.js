import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import { useAuthStore } from './auth'

export const useTaskStore = defineStore('task', () => {
  // 状态
  const tasks = ref([])
  const selectedDate = ref(null)
  const showCompletedTasks = ref(false)
  const isTaskModalVisible = ref(false)
  const editingTask = ref(null)
  const isLoading = ref(false)
  const currentDate = ref(new Date())

  // 计算属性
  const visibleTasks = computed(() => {
    if (showCompletedTasks.value) {
      return tasks.value
    }
    return tasks.value.filter(task => !task.completed)
  })

  const tasksByDate = computed(() => {
    const grouped = {}
    tasks.value.forEach(task => {
      const date = task.dueDate
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(task)
    })
    return grouped
  })

  const completedTasksCount = computed(() => {
    return tasks.value.filter(task => task.completed).length
  })

  const totalTasksCount = computed(() => {
    return tasks.value.length
  })

  const progressPercentage = computed(() => {
    if (totalTasksCount.value === 0) return 0
    return Math.round((completedTasksCount.value / totalTasksCount.value) * 100)
  })

  // 初始化任务数据
  const initializeTasks = async () => {
    const authStore = useAuthStore()
    
    if (authStore.isLoggedIn) {
      await fetchTasks()
    } else {
      loadLocalTasks()
    }
    
    // 设置默认选中今天的日期
    const today = new Date()
    selectedDate.value = today.toISOString().split('T')[0]
  }

  // 从服务器获取任务
  const fetchTasks = async () => {
    try {
      isLoading.value = true
      const response = await apiService.getTasks()
      tasks.value = response || []
    } catch (error) {
      console.error('获取任务失败:', error)
      // 如果服务器请求失败，回退到本地任务
      loadLocalTasks()
    } finally {
      isLoading.value = false
    }
  }

  // 加载本地任务
  const loadLocalTasks = () => {
    const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]')
    tasks.value = localTasks
  }

  // 保存本地任务
  const saveLocalTasks = () => {
    localStorage.setItem('local_tasks', JSON.stringify(tasks.value))
  }

  // 添加任务
  const addTask = async (taskData) => {
    const authStore = useAuthStore()
    
    try {
      isLoading.value = true
      
      if (authStore.isLoggedIn) {
        const newTask = await apiService.createTask(taskData)
        tasks.value.push(newTask)
      } else {
        const newTask = {
          id: Date.now(),
          ...taskData,
          completed: false
        }
        tasks.value.push(newTask)
        saveLocalTasks()
      }
      
      return { success: true }
    } catch (error) {
      console.error('添加任务失败:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 更新任务
  const updateTask = async (taskId, updates) => {
    const authStore = useAuthStore()
    
    try {
      isLoading.value = true
      
      if (authStore.isLoggedIn) {
        const updatedTask = await apiService.updateTask(taskId, updates)
        const index = tasks.value.findIndex(t => t.id === taskId)
        if (index !== -1) {
          tasks.value[index] = updatedTask
        }
      } else {
        const index = tasks.value.findIndex(t => t.id == taskId)
        if (index !== -1) {
          tasks.value[index] = { ...tasks.value[index], ...updates }
          saveLocalTasks()
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('更新任务失败:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 删除任务
  const deleteTask = async (taskId) => {
    const authStore = useAuthStore()
    
    try {
      isLoading.value = true
      
      if (authStore.isLoggedIn) {
        await apiService.deleteTask(taskId)
      }
      
      tasks.value = tasks.value.filter(t => t.id != taskId)
      
      if (!authStore.isLoggedIn) {
        saveLocalTasks()
      }
      
      return { success: true }
    } catch (error) {
      console.error('删除任务失败:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  // 切换任务完成状态
  const toggleTask = async (taskId, completed) => {
    return await updateTask(taskId, { completed })
  }

  // 同步本地任务到服务器
  const syncLocalTasks = async () => {
    const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]')
    if (localTasks.length > 0) {
      try {
        await apiService.syncTasks(localTasks)
        localStorage.removeItem('local_tasks')
        await fetchTasks()
        return { success: true }
      } catch (error) {
        console.error('同步任务失败:', error)
        return { success: false, error: error.message }
      }
    }
    return { success: true }
  }

  // 显示任务模态框
  const showTaskModal = (task = null) => {
    editingTask.value = task
    isTaskModalVisible.value = true
  }

  // 隐藏任务模态框
  const hideTaskModal = () => {
    isTaskModalVisible.value = false
    editingTask.value = null
  }

  // 切换显示已完成任务
  const toggleShowCompleted = () => {
    showCompletedTasks.value = !showCompletedTasks.value
  }

  // 设置选中日期
  const setSelectedDate = (date) => {
    selectedDate.value = date
  }

  // 获取日期的任务状态
  const getDateTaskStatus = (dateStr) => {
    const dateTasks = tasksByDate.value[dateStr] || []
    if (dateTasks.length === 0) return null
    
    const completedCount = dateTasks.filter(task => task.completed).length
    const totalCount = dateTasks.length
    
    if (completedCount === 0) return 'red'      // 全部未完成
    if (completedCount === totalCount) return 'green'  // 全部完成
    return 'orange'  // 部分完成
  }

  return {
    // 状态
    tasks,
    selectedDate,
    showCompletedTasks,
    isTaskModalVisible,
    editingTask,
    isLoading,
    currentDate,
    
    // 计算属性
    visibleTasks,
    tasksByDate,
    completedTasksCount,
    totalTasksCount,
    progressPercentage,
    
    // 方法
    initializeTasks,
    fetchTasks,
    loadLocalTasks,
    saveLocalTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    syncLocalTasks,
    showTaskModal,
    hideTaskModal,
    toggleShowCompleted,
    setSelectedDate,
    getDateTaskStatus
  }
}) 