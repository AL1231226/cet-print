<template>
  <div
    class="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors"
    :class="isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @drop.prevent="onDrop"
    @click="inputRef?.click()"
  >
    <input
      ref="inputRef"
      type="file"
      :accept="accept.join(',')"
      multiple
      class="hidden"
      @change="onFileChange"
    />
    <p class="text-gray-500 mb-1">拖拽文件到此处，或点击选择</p>
    <p class="text-xs text-gray-400">支持 PDF / JPG / PNG 格式</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  accept: { type: Array, default: () => ['.pdf', '.jpg', '.jpeg', '.png'] },
})

const emit = defineEmits(['files-selected'])
const inputRef = ref(null)
const isDragOver = ref(false)

function onDrop(e) {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer.files)
  if (files.length) emit('files-selected', files)
}

function onFileChange(e) {
  const files = Array.from(e.target.files)
  if (files.length) emit('files-selected', files)
  // 重置 input，允许重复选择同一文件
  if (inputRef.value) inputRef.value.value = ''
}
</script>
