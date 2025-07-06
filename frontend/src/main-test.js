import { createApp } from 'vue'

console.log('开始加载Vue应用...')

// 创建一个简单的根组件
const App = {
  template: `
    <div class="min-h-screen bg-gray-50 p-8">
      <h1 class="text-4xl font-bold text-center text-blue-600">
        🎉 Vue 3 测试成功！
      </h1>
      <div class="text-center mt-8">
        <p class="text-xl text-gray-700 mb-4">应用正在正常运行</p>
        <button 
          @click="count++" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          点击计数: {{ count }}
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      count: 0
    }
  }
}

console.log('创建Vue应用实例...')

try {
  const app = createApp(App)
  console.log('挂载Vue应用到#app...')
  app.mount('#app')
  console.log('Vue应用挂载成功！')
} catch (error) {
  console.error('Vue应用挂载失败:', error)
  document.body.innerHTML = `<div style="padding: 20px; color: red;">Vue应用加载失败: ${error.message}</div>`
} 