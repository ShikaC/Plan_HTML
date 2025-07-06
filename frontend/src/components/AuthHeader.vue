<template>
  <div class="absolute top-4 right-4">
    <!-- 未登录时显示登录/注册按钮 -->
    <div v-if="!authStore.isLoggedIn" class="space-x-2">
      <button
        @click="authStore.showAuthModal('login')"
        class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-200 rounded-lg shadow-sm transition-colors"
      >
        登录
      </button>
      <button
        @click="authStore.showAuthModal('register')"
        class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors"
      >
        注册
      </button>
    </div>

    <!-- 已登录时显示用户信息 -->
    <div v-else class="flex items-center gap-4">
      <span class="text-gray-700 font-semibold">
        欢迎, {{ authStore.user.username }}
      </span>
      <button
        @click="authStore.logout"
        class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-200 rounded-lg shadow-sm transition-colors"
      >
        退出
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script> 