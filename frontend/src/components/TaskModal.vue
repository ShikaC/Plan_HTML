<template>
  <Transition name="modal">
    <div 
      v-if="taskStore.isTaskModalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="handleBackdropClick"
    >
      <div 
        class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-transform duration-300"
        @click.stop
      >
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          {{ taskStore.editingTask ? '编辑任务' : '添加新任务' }}
        </h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="task-name" class="block text-gray-700 text-sm font-bold mb-2">
              任务名称
            </label>
            <input
              id="task-name"
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-3 bg-gray-100 rounded-lg border-transparent focus:border-blue-500 focus:bg-white focus:ring-0"
              required
              placeholder="例如: 完成数学第一章练习"
            />
          </div>
          
          <div class="mb-6">
            <label for="task-date" class="block text-gray-700 text-sm font-bold mb-2">
              截止日期
            </label>
            <input
              id="task-date"
              v-model="formData.dueDate"
              type="date"
              class="w-full px-4 py-3 bg-gray-100 rounded-lg border-transparent focus:border-blue-500 focus:bg-white focus:ring-0"
              required
            />
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
              :disabled="isSubmitting"
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, ref, watch, nextTick } from 'vue'
import { useTaskStore } from '@/stores/task'

const taskStore = useTaskStore()
const isSubmitting = ref(false)

const formData = reactive({
  name: '',
  dueDate: ''
})

// 重置表单 - 提前定义
const resetForm = () => {
  formData.name = ''
  formData.dueDate = ''
}

// 监听编辑任务的变化，填充表单
watch(() => taskStore.editingTask, (task) => {
  if (task) {
    formData.name = task.name
    formData.dueDate = task.dueDate
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听模态框显示状态，设置默认日期
watch(() => taskStore.isTaskModalVisible, (visible) => {
  if (visible && !taskStore.editingTask) {
    // 如果有选中的日期，使用选中的日期，否则使用今天
    const defaultDate = taskStore.selectedDate || new Date().toISOString().split('T')[0]
    formData.dueDate = defaultDate
  }
})

// 处理表单提交
const handleSubmit = async () => {
  if (!formData.name.trim() || !formData.dueDate) {
    alert('请填写任务名称和截止日期')
    return
  }

  isSubmitting.value = true
  
  try {
    const taskData = {
      name: formData.name.trim(),
      dueDate: formData.dueDate
    }

    let result
    if (taskStore.editingTask) {
      // 编辑任务
      result = await taskStore.updateTask(taskStore.editingTask.id, taskData)
    } else {
      // 添加新任务
      result = await taskStore.addTask(taskData)
    }

    if (result.success) {
      taskStore.hideTaskModal()
      resetForm()
    } else {
      alert(result.error || '操作失败')
    }
  } catch (error) {
    console.error('提交任务失败:', error)
    alert('操作失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 处理取消
const handleCancel = () => {
  taskStore.hideTaskModal()
  resetForm()
}

// 处理背景点击
const handleBackdropClick = () => {
  handleCancel()
}
</script> 