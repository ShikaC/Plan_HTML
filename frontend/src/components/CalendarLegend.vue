<template>
  <div class="bg-white p-4 rounded-2xl shadow-lg shadow-gray-200/50">
    <h3 class="text-lg font-bold text-gray-700 mb-3">状态说明</h3>
    <div class="space-y-2 text-sm">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
        <span>全部未完成</span>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
        <span>部分完成</span>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <span>全部完成</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这个组件不需要任何逻辑，只是展示图例
</script> 