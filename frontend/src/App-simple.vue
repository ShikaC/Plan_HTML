<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">我的学习计划 - Vue3版本</h1>
    
    <div class="max-w-4xl mx-auto">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-semibold mb-4">应用状态测试</h2>
        
        <div class="space-y-4">
          <div class="p-4 bg-green-100 rounded">
            <p class="text-green-800">✅ Vue 3 应用已成功加载</p>
          </div>
          
          <div class="p-4 bg-blue-100 rounded">
            <p class="text-blue-800">✅ Tailwind CSS 样式正常工作</p>
          </div>
          
          <div class="p-4 bg-yellow-100 rounded">
            <p class="text-yellow-800">🔍 正在测试组件和状态管理...</p>
          </div>
          
          <button 
            @click="testClick"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            点击测试响应性
          </button>
          
          <div v-if="clicked" class="p-4 bg-green-100 rounded">
            <p class="text-green-800">✅ Vue 响应性正常工作！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const clicked = ref(false)

const testClick = () => {
  clicked.value = true
  console.log('按钮点击测试成功！')
}

console.log('Vue 3 应用已成功初始化')
</script> 