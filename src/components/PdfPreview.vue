<template>
  <div v-if="status === 'processing'" class="text-center py-8">
    <p class="text-gray-500">处理中，请稍候...</p>
  </div>

  <div v-else-if="status === 'done'" class="text-center py-8">
    <p class="text-green-600 mb-4">处理完成！共 {{ pageCount }} 页</p>
    <button
      @click="$emit('download')"
      class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
    >
      下载打印版 PDF
    </button>
    <button
      @click="$emit('reset')"
      class="ml-3 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      重新选择
    </button>
  </div>

  <div v-else-if="status === 'error'" class="text-center py-8">
    <p class="text-red-500 mb-2">{{ errorMsg }}</p>
    <button
      @click="$emit('reset')"
      class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      重新选择
    </button>
  </div>
</template>

<script setup>
defineProps({
  status: { type: String, default: 'idle' }, // idle | processing | done | error
  pageCount: { type: Number, default: 0 },
  errorMsg: { type: String, default: '' },
})

defineEmits(['download', 'reset'])
</script>
