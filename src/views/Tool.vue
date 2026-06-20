<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-1">排版打印工具</h1>
    <p class="text-gray-500 text-sm mb-6">
      上传试卷 PDF 或图片，自动裁剪边距，生成 A4 打印版
    </p>

    <Uploader v-if="!selectedFiles" @files-selected="onFilesSelected" />

    <PdfPreview
      v-else
      :status="status"
      :page-count="pageCount"
      :error-msg="errorMsg"
      @download="onDownload"
      @reset="onReset"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Uploader from '../components/Uploader.vue'
import PdfPreview from '../components/PdfPreview.vue'
import { processPdf, processImages } from '../utils/pdfProcessor.js'

const selectedFiles = ref(null)
const status = ref('idle') // idle | processing | done | error
const pageCount = ref(0)
const errorMsg = ref('')

function onFilesSelected(files) {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
  const invalidFiles = files.filter(f => !validTypes.includes(f.type))
  if (invalidFiles.length > 0) {
    status.value = 'error'
    errorMsg.value = `不支持的文件格式：${invalidFiles.map(f => f.name).join('、')}`
    return
  }
  selectedFiles.value = files
  process(files)
}

async function process(files) {
  status.value = 'processing'
  errorMsg.value = ''

  try {
    const pdfFiles = files.filter(f => f.type === 'application/pdf')
    const imageFiles = files.filter(f => f.type.startsWith('image/'))

    let totalPages = 0

    // 处理 PDF
    for (const file of pdfFiles) {
      const canvases = await processPdf(file)
      totalPages += canvases.length
    }

    // 处理图片
    if (imageFiles.length > 0) {
      await processImages(imageFiles)
      totalPages += imageFiles.length
    }

    pageCount.value = totalPages
    status.value = 'done'
  } catch (e) {
    console.error(e)
    status.value = 'error'
    errorMsg.value = '处理失败：' + (e.message || '未知错误')
  }
}

async function onDownload() {
  await process(selectedFiles.value)
}

function onReset() {
  selectedFiles.value = null
  status.value = 'idle'
  pageCount.value = 0
  errorMsg.value = ''
}
</script>
