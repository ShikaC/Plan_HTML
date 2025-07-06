import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

console.log('正在启动完整的Vue 3应用...')

try {
  const app = createApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  console.log('挂载应用到#app...')
  app.mount('#app')
  console.log('Vue 3应用启动成功！')
} catch (error) {
  console.error('应用启动失败:', error)
} 