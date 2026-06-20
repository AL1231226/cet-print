import * as pdfjsLib from 'pdfjs-dist'

// PDF.js worker 使用 CDN 版本，避免打包体积过大
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js`

/**
 * 将 PDF 文件逐页渲染为图片（Canvas）
 * @param {File} file - PDF 文件
 * @returns {Promise<HTMLCanvasElement[]>} 每页渲染后的 Canvas 数组
 */
export async function pdfToImages(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const canvases = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2 }) // 2x 保证清晰度
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise
    canvases.push(canvas)
  }

  return canvases
}

/**
 * 裁剪图片四周空白边距
 * 策略：从四边向内扫描，找到第一个非白色像素的位置
 * @param {HTMLCanvasElement} canvas
 * @param {number} [threshold=250] - 判定为"白色"的阈值（0-255）
 * @returns {HTMLCanvasElement} 裁剪后的新 Canvas
 */
export function cropWhiteMargin(canvas, threshold = 250) {
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // 判断像素是否为"白色"
  const isWhite = (x, y) => {
    const idx = (y * width + x) * 4
    return data[idx] >= threshold && data[idx + 1] >= threshold && data[idx + 2] >= threshold
  }

  // 从上往下扫描
  let top = 0
  for (let y = 0; y < height; y++) {
    let allWhite = true
    for (let x = 0; x < width; x++) {
      if (!isWhite(x, y)) { allWhite = false; break }
    }
    if (!allWhite) { top = y; break }
  }

  // 从下往上扫描
  let bottom = height - 1
  for (let y = height - 1; y >= 0; y--) {
    let allWhite = true
    for (let x = 0; x < width; x++) {
      if (!isWhite(x, y)) { allWhite = false; break }
    }
    if (!allWhite) { bottom = y; break }
  }

  // 从左往右扫描
  let left = 0
  for (let x = 0; x < width; x++) {
    let allWhite = true
    for (let y = top; y <= bottom; y++) {
      if (!isWhite(x, y)) { allWhite = false; break }
    }
    if (!allWhite) { left = x; break }
  }

  // 从右往左扫描
  let right = width - 1
  for (let x = width - 1; x >= 0; x--) {
    let allWhite = true
    for (let y = top; y <= bottom; y++) {
      if (!isWhite(x, y)) { allWhite = false; break }
    }
    if (!allWhite) { right = x; break }
  }

  // 如果没有找到内容（全白图），返回原图
  if (top >= bottom || left >= right) return canvas

  // 创建裁剪后的 Canvas
  const croppedW = right - left + 1
  const croppedH = bottom - top + 1
  const cropped = document.createElement('canvas')
  cropped.width = croppedW
  cropped.height = croppedH
  cropped.getContext('2d').drawImage(canvas, left, top, croppedW, croppedH, 0, 0, croppedW, croppedH)

  return cropped
}

/**
 * 将多张图片合并为单个 PDF 并下载
 * @param {HTMLCanvasElement[]} canvases - 要合成的图片 Canvas
 * @param {string} [filename='output.pdf'] - 下载文件名
 */
export async function downloadAsPdf(canvases, filename = 'output.pdf') {
  // 动态导入 jsPDF，避免初始加载过重
  const { default: jsPDF } = await import('jspdf')

  // A4 尺寸（mm）
  const A4_W = 210
  const A4_H = 297

  const pdf = new jsPDF('p', 'mm', 'a4')

  canvases.forEach((canvas, i) => {
    if (i > 0) pdf.addPage()

    const imgData = canvas.toDataURL('image/png')
    const imgW = A4_W
    const imgH = (canvas.height / canvas.width) * A4_W

    // 如果图片比例超过 A4，按高度缩放
    if (imgH > A4_H) {
      const scale = A4_H / imgH
      pdf.addImage(imgData, 'PNG', (A4_W - imgW * scale) / 2, 0, imgW * scale, A4_H)
    } else {
      pdf.addImage(imgData, 'PNG', 0, (A4_H - imgH) / 2, imgW, imgH)
    }
  })

  pdf.save(filename)
}

/**
 * 一键处理：上传 → 渲染 → 裁剪 → 下载
 * @param {File} file - 上传的 PDF 文件
 * @param {string} [filename] - 下载文件名
 */
export async function processPdf(file, filename) {
  const canvases = await pdfToImages(file)
  const cropped = canvases.map(c => cropWhiteMargin(c))
  await downloadAsPdf(cropped, filename || file.name.replace(/\.pdf$/i, '_打印版.pdf'))
}

/**
 * 处理图片文件：裁剪边距 → 合并为 PDF
 * @param {File[]} imageFiles - 图片文件数组
 * @param {string} [filename]
 */
export async function processImages(imageFiles, filename = 'output.pdf') {
  const canvases = await Promise.all(
    imageFiles.map(file => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
          URL.revokeObjectURL(url)
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          canvas.getContext('2d').drawImage(img, 0, 0)
          resolve(canvas)
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error(`图片加载失败: ${file.name}`))
        }
        img.src = url
      })
    })
  )
  const cropped = canvases.map(c => cropWhiteMargin(c))
  await downloadAsPdf(cropped, filename)
}
